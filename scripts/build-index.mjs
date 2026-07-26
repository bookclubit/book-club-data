#!/usr/bin/env node
/**
 * Генератор index.json — единственный способ обновить реестр.
 *
 * index.json — производный артефакт: он собирается из books/, events/,
 * speakers.json и settings.json. Руками и в PR-ах его не менять —
 * GitHub Action пересобирает его после каждого пуша в main.
 *
 * Запуск:
 *   node scripts/build-index.mjs           # пересобрать index.json
 *   node scripts/build-index.mjs --check   # сравнить с существующим, exit 1 при расхождении
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_PATH = join(ROOT, "index.json");

/** Читает и парсит JSON-файл, падает с понятной ошибкой. */
async function readJson(path) {
  const raw = await readFile(path, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Невалидный JSON: ${path}\n${err.message}`);
  }
}

/** Список поддиректорий (отсортированный по имени). */
async function listDirs(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** Список файлов *.json в директории (отсортированный по имени). */
async function listJsonFiles(path) {
  if (!existsSync(path)) return [];
  const entries = await readdir(path, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => e.name)
    .sort();
}

/** Собирает записи книг из books/*. */
async function buildBooks() {
  const books = [];
  for (const folder of await listDirs(join(ROOT, "books"))) {
    const meta = await readJson(join(ROOT, "books", folder, "meta.json"));

    // В реестр попадают ВСЕ главы с chapter.json — глава видна сразу после
    // создания, даже пустая. Число тем едет рядом (`topics`), чтобы клиенты
    // могли отличить разобранную главу от заготовки без лишних запросов.
    const chapters = [];
    const chaptersDir = join(ROOT, "books", folder, "chapters");
    if (existsSync(chaptersDir)) {
      for (const chapterFolder of await listDirs(chaptersDir)) {
        const chapterPath = join(chaptersDir, chapterFolder, "chapter.json");
        if (!existsSync(chapterPath)) continue;
        const chapter = await readJson(chapterPath);
        chapters.push({
          slug: chapterFolder,
          order: typeof chapter.order === "number" ? chapter.order : 0,
          title: chapter.title ?? chapterFolder,
          topics: Array.isArray(chapter.topics) ? chapter.topics.length : 0,
        });
      }
      chapters.sort((a, b) => a.order - b.order);
    }

    const book = {
      folder,
      id: meta.id,
      title: meta.title,
      status: meta.status,
    };
    if (meta.category) book.category = meta.category;
    book.chapters = chapters;
    books.push(book);
  }
  return books;
}

/** Собирает список путей событий из events/. */
async function buildEvents() {
  const events = [];
  for (const kind of ["closed-chapters", "live-talks"]) {
    for (const file of await listJsonFiles(join(ROOT, "events", kind))) {
      events.push(`${kind}/${file}`);
    }
  }
  return events.sort();
}

async function buildIndex() {
  const settings = await readJson(join(ROOT, "settings.json"));
  const { speakers } = await readJson(join(ROOT, "speakers.json"));

  if (!settings.active_book) {
    throw new Error("В settings.json нет поля active_book");
  }
  if (!Array.isArray(speakers)) {
    throw new Error("В speakers.json нет массива speakers");
  }

  return {
    version: 2,
    active_book: settings.active_book,
    books: await buildBooks(),
    events: await buildEvents(),
    speakers,
  };
}

const output = JSON.stringify(await buildIndex(), null, 2) + "\n";

if (process.argv.includes("--check")) {
  const current = existsSync(INDEX_PATH)
    ? await readFile(INDEX_PATH, "utf8")
    : "";
  if (current !== output) {
    console.error(
      "index.json устарел: запусти `node scripts/build-index.mjs` и закоммить результат.",
    );
    process.exit(1);
  }
  console.log("index.json актуален.");
} else {
  await writeFile(INDEX_PATH, output);
  console.log("index.json пересобран.");
}
