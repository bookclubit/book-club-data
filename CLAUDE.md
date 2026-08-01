# Book Club Data Repository

## Назначение

Хранилище данных книжного клуба для фронтендеров. Все данные в форматах JSON/Markdown.

## Структура

```
index.json                        # реестр книг/глав/событий/спикеров — ГЕНЕРИРУЕТСЯ автоматически, руками не менять
speakers.json                     # источник правды по спикерам: id, name, aliases, avatar, socials
settings.json                     # настройки клуба: active_book (активная книга), socials
scripts/build-index.mjs           # генератор index.json (Node 20+, без зависимостей); режим --check
books/<slug>/
  meta.json                       # id, title, авторы [{id, name, avatar, url}], cover, tags, status, total_chapters, code (для генератора презентаций talks: DOCKER, REACT)
  flashcards.json                 # колода карточек книги (ANKI), пополняется по главам: [{id, type: qa|command, question+answer | command+result, example (НЕОБЯЗАТЕЛЕН — пример под ответом), chapter, difficulty}]
  chapters/<NN-slug>/
    chapter.json                  # глава целиком: order, title, topics[{id, title, speakers[], video_youtube, video_vk, presentation, resources[]}]; описания главы и learning_outcome нет (июль 2026: главное в главе — темы, отдельной страницы у неё в miniapp больше нет)
events/
  closed-chapters/*.json          # «открытое обсуждение» главы: книга, глава, pages{from,to}, assignment (НЕОБЯЗАТЕЛЕН: перекрывает шаблонное задание, которое бот собирает из главы и страниц), notes_board_url (доска — ссылка или файл media/boards), streams{youtube,vk}, call_url (Google Meet), stream (номер эфира → «Книжный клуб N»), moderators[{speaker_id,name,avatar}], materials[{title,url}], finished
  live-talks/*.json               # «доклады» (чистовая запись докладов): assignment (необязателен — см. выше), streams{youtube,vk}, talks[{title, speaker, avatar, topic_id (тема главы), slides_url (презентация talks)}], materials, program[{book_id, chapter, topic_ids[]}] (программа эфира блоками: за вечер разбирают несколько глав и даже книг; пустой topic_ids = вся глава; старые встречи вместо program хранят book_id+chapter+topic_ids прямо в событии — это тот же единственный блок, и читатели разбирают оба вида одной функцией), recordings{<topic_id>:{youtube,vk}} (монтажные ролики докладов — на странице спикера вместо записи всей встречи), stream (номер стрима для talks BC-<stream>-…), finished; call_url и registration_url НЕ используются (регистрация — через бота)
media/
  covers/*.webp                   # обложки книг
  authors/*.webp                  # аватарки авторов
  speakers/*.webp                 # аватарки спикеров
  boards/*.webp                   # доски завершённых обсуждений (если загружены файлом)
```

## Скиллы (`.claude/skills/`)

Все действия автоматизированы — вызывай скилл, а не редактируй файлы вручную:

- `add-book` — добавить книгу (папка, meta.json, обложка, авторы)
- `add-chapter` — добавить главу вместе с темами (папка + chapter.json)
- `add-flashcards` — добавить карточки в flashcards.json
- `add-event` — добавить встречу (закрытую или открытую)
- `add-speaker` — добавить спикера (аватарка в WebP + speaker_id)

## index.json — генерируемый артефакт

`index.json` собирается скриптом `scripts/build-index.mjs` из `books/`, `events/`,
`speakers.json` и `settings.json`. **Руками и в PR-ах его не менять** — после
мержа в main GitHub Action (`.github/workflows/build-index.yml`) пересобирает
его автоматически. Это устраняет гонку, когда два параллельных PR перезаписывают
реестр и теряют записи друг друга.

- Спикеры живут в `speakers.json`, активная книга — в поле `active_book`
  файла `settings.json`; `index.json` только агрегирует их.
- **Авторы живут в `meta.json` книг** (отдельного файла-каталога нет: автор
  существует ровно потому, что у него есть книга). У автора обязателен `id`
  в kebab-case — он связывает книги одного человека: `index.json` собирает
  из книг список `authors[{id, name, avatar, url, books[]}]`. По нему CMS
  предлагает выбрать существующего автора, а miniapp показывает страницу
  автора со всеми его книгами. **У автора двух книг `id` и имя должны
  совпадать буквально** — иначе он раздвоится. Если `id` не указан (старые
  записи), генератор берёт имя файла аватарки, затем имя.
- В `chapters` книги попадают **все** главы с `chapter.json` —
  `{slug, order, title, topics}`, где `topics` — число тем. Глава видна
  клиентам сразу после создания, даже пустая; «разобранность» считается по
  `topics > 0`. Формат реестра — `version: 2`.
- Локальная пересборка: `node scripts/build-index.mjs`;
  проверка актуальности: `node scripts/build-index.mjs --check`.
- На pull request-ах CI (`.github/workflows/validate.yml`) гоняет prettier,
  валидность всех JSON и успешный прогон генератора (без `--check`:
  index.json в PR законно «отстаёт» и пересоберётся после мержа).

## Правила

- Все JSON файлы должны быть валидными (проверять через JSON.parse)
- `index.json` не редактировать — см. раздел выше
- Названия папок — kebab-case
- Изображения — WebP, оптимизировать до 200KB (конвертация через `sharp`, оригиналы не коммитить)
- Не изменять структуру существующих файлов без явного запроса
- Перед коммитом проверять `npx prettier --check .`
- Коммиты по Conventional Commits: `тип(область): описание` (типы: feat, fix, docs, style, refactor, test, chore)
- Название (описание) коммита — на русском языке
- Не пушить после каждого коммита — только по явному запросу
