#!/usr/bin/env node
/**
 * Проверка встреч: ссылки на книги, главы и темы + типичные ошибки разбивки
 * главы на несколько эфиров.
 *
 * Зачем: miniapp и бот строят программу вечера по `program[].topic_ids`. Если
 * главу делят на два вечера, а темы по эфирам не расписаны, оба эфира покажут
 * все темы главы — «одинаковые темы» у двух встреч (так было со стримами 90 и 91).
 * Такое видно только глазами в интерфейсе, поэтому ловим на уровне данных.
 *
 * Запуск: node scripts/validate-events.mjs [--strict]
 * Ошибки (код 1): битые ссылки, тема в двух эфирах одной главы, повтор темы
 * внутри встречи, расхождение program с плоскими полями, дубль номера стрима
 * у эфиров с докладами.
 * Замечания (код 0): глава поделена, а темы не расписаны; номер стрима занят
 * ещё и обсуждением главы. С `--strict` замечания тоже роняют проверку.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STRICT = process.argv.includes("--strict");
const read = (p) => JSON.parse(readFileSync(p, "utf8"));

const errors = [];
const warnings = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

// ---------- книги и темы глав ----------
const books = new Map(); // id и folder → folder
for (const folder of readdirSync(join(ROOT, "books"))) {
  const metaPath = join(ROOT, "books", folder, "meta.json");
  if (!existsSync(metaPath)) continue;
  const meta = read(metaPath);
  books.set(folder, folder);
  if (meta.id) books.set(meta.id, folder);
}

const chapters = new Map(); // `${folder}/${slug}` → { order, topicIds }
for (const folder of new Set(books.values())) {
  const dir = join(ROOT, "books", folder, "chapters");
  if (!existsSync(dir)) continue;
  for (const slug of readdirSync(dir)) {
    const file = join(dir, slug, "chapter.json");
    if (!existsSync(file)) continue;
    const chapter = read(file);
    chapters.set(`${folder}/${slug}`, {
      order: chapter.order,
      topicIds: (chapter.topics ?? []).map((t) => t.id),
    });
  }
}

// ---------- встречи ----------
const events = [];
for (const kind of ["closed-chapters", "live-talks"]) {
  const dir = join(ROOT, "events", kind);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    events.push({ file: `events/${kind}/${name}`, ...read(join(dir, name)) });
  }
}

/** Программа блоками; у старых встреч книга и глава лежат прямо в событии. */
const programOf = (event) =>
  event.program?.length
    ? event.program
    : event.book_id && event.chapter
      ? [
          {
            book_id: event.book_id,
            chapter: event.chapter,
            topic_ids: event.topic_ids,
          },
        ]
      : [];

const byChapter = new Map(); // `${folder}/${slug}` → [{ event, ids }]

for (const event of events) {
  const blocks = programOf(event);
  if (blocks.length === 0) {
    fail(event.file, "нет ни program, ни пары book_id + chapter");
    continue;
  }

  // Плоские поля — копия первого блока для старых клиентов: разъехались, значит
  // где-то правили руками только одно из двух мест.
  if (event.program?.length === 1) {
    const [block] = event.program;
    if (event.chapter && block.chapter !== event.chapter)
      fail(
        event.file,
        `program[0].chapter (${block.chapter}) ≠ chapter (${event.chapter})`,
      );
    const inProgram = [...(block.topic_ids ?? [])].sort().join(",");
    const flat = [...(event.topic_ids ?? [])].sort().join(",");
    if (event.topic_ids && inProgram !== flat)
      fail(
        event.file,
        `program[0].topic_ids (${inProgram || "—"}) ≠ topic_ids (${flat || "—"})`,
      );
  }

  for (const block of blocks) {
    const folder = books.get(block.book_id);
    if (!folder) {
      fail(event.file, `неизвестная книга: ${block.book_id}`);
      continue;
    }
    const key = `${folder}/${block.chapter}`;
    const chapter = chapters.get(key);
    if (!chapter) {
      fail(event.file, `нет главы ${key}`);
      continue;
    }
    const ids = block.topic_ids ?? [];
    for (const id of ids)
      if (!chapter.topicIds.includes(id))
        fail(event.file, `тема ${id} не найдена в главе ${key}`);
    const twice = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    if (twice.length)
      fail(event.file, `тема повторяется внутри встречи: ${twice.join(", ")}`);

    if (event.type === "live-talk") {
      if (!byChapter.has(key)) byChapter.set(key, []);
      byChapter.get(key).push({ event, ids });
    }
  }

  // Запись доклада должна ссылаться на тему этой встречи.
  const own = blocks.flatMap((b) => b.topic_ids ?? []);
  if (own.length > 0)
    for (const id of Object.keys(event.recordings ?? {}))
      if (!own.includes(id))
        fail(event.file, `запись для темы ${id}, которой нет в программе`);
}

// ---------- глава, поделённая между эфирами ----------
for (const [key, list] of byChapter) {
  if (list.length < 2) continue;
  const blank = list.filter((x) => x.ids.length === 0);
  for (const { event } of blank)
    warn(
      event.file,
      `главу ${key} разбирают ${list.length} эфира, но темы этого эфира не расписаны — ` +
        "в интерфейсе он покажет все темы главы, как и остальные части",
    );
  const owners = new Map();
  for (const { event, ids } of list)
    for (const id of ids) {
      if (!owners.has(id)) owners.set(id, []);
      owners.get(id).push(event.stream ?? event.file);
    }
  for (const [id, streams] of owners)
    if (streams.length > 1)
      fail(
        `глава ${key}`,
        `тема ${id} записана сразу в эфиры ${streams.join(" и ")}`,
      );
}

// ---------- номера стримов ----------
const streams = new Map();
for (const event of events) {
  if (event.stream == null) continue;
  if (!streams.has(event.stream)) streams.set(event.stream, []);
  streams.get(event.stream).push(event);
}
for (const [stream, list] of streams) {
  if (list.length < 2) continue;
  const talks = list.filter((e) => e.type === "live-talk");
  const where = list.map((e) => e.file).join(" + ");
  if (talks.length > 1)
    fail(`стрим ${stream}`, `номер занят несколькими эфирами: ${where}`);
  else
    warn(
      `стрим ${stream}`,
      `номер занят и обсуждением главы, и эфиром: ${where}`,
    );
}

// ---------- итог ----------
for (const message of errors) console.error(`✖ ${message}`);
for (const message of warnings) console.warn(`⚠ ${message}`);
console.log(
  `Проверено встреч: ${events.length}. Ошибок: ${errors.length}, замечаний: ${warnings.length}.`,
);
if (errors.length > 0 || (STRICT && warnings.length > 0)) process.exit(1);
