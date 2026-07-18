# Book Club Data Repository

## Назначение

Хранилище данных книжного клуба для фронтендеров. Все данные в форматах JSON/Markdown.

## Структура

```
books/<slug>/
  meta.json                       # id, title, авторы [{name, avatar}], cover, tags, status, total_chapters, code (для генератора презентаций talks: DOCKER, REACT)
  flashcards.json                 # колода карточек книги (ANKI), пополняется по главам
  chapters/<NN-slug>/
    chapter.json                  # индекс главы: order, title, description, learning_outcome, topics[]
    <MM-slug>.md                  # тема: frontmatter (video_youtube, video_vk, presentation, resources, speakers) + описание/инсайты
events/
  closed-chapters/*.json          # «открытое обсуждение» главы: книга, глава, pages{from,to}, notes_board_url (доска — ссылка или файл media/boards), streams{youtube,vk}, call_url (Google Meet), moderators[{speaker_id,name,avatar}], materials[{title,url}], finished
  live-talks/*.json               # «доклады» (чистовая запись докладов): streams{youtube,vk}, talks[{title, speaker, avatar, topic_id (тема главы), slides_url (презентация talks)}], materials, book_id+chapter (программа — темы главы становятся слотами докладов), stream (номер стрима для talks BC-<stream>-…), finished; call_url и registration_url НЕ используются (регистрация — через бота)
media/
  covers/*.webp                   # обложки книг
  authors/*.webp                  # аватарки авторов
  speakers/*.webp                 # аватарки спикеров
  boards/*.webp                   # доски завершённых обсуждений (если загружены файлом)
```

## Скиллы (`.claude/skills/`)

Все действия автоматизированы — вызывай скилл, а не редактируй файлы вручную:

- `add-book` — добавить книгу (папка, meta.json, обложка, авторы)
- `add-chapter` — добавить главу (папка + chapter.json)
- `add-topic` — добавить тему в главу (.md + регистрация в chapter.json)
- `add-flashcards` — добавить карточки в flashcards.json
- `add-event` — добавить встречу (закрытую или открытую)
- `add-speaker` — добавить спикера (аватарка в WebP + speaker_id)

## Правила

- Все JSON файлы должны быть валидными (проверять через JSON.parse)
- Названия папок — kebab-case
- Изображения — WebP, оптимизировать до 200KB (конвертация через `sharp`, оригиналы не коммитить)
- Не изменять структуру существующих файлов без явного запроса
- Перед коммитом проверять `npx prettier --check .`
- Коммиты по Conventional Commits: `тип(область): описание` (типы: feat, fix, docs, style, refactor, test, chore)
- Название (описание) коммита — на русском языке
- Не пушить после каждого коммита — только по явному запросу
