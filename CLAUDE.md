# Book Club Data Repository

## Назначение

Хранилище данных книжного клуба для фронтендеров. Все данные в форматах JSON/Markdown.

## Структура

```
books/<slug>/
  meta.json                       # id, title, авторы [{name, avatar}], cover, tags, status, total_chapters
  flashcards.json                 # колода карточек книги (ANKI), пополняется по главам
  chapters/<NN-slug>/
    chapter.json                  # индекс главы: order, title, description, learning_outcome, topics[]
    <MM-slug>.md                  # тема: frontmatter (video_youtube, video_vk, presentation, resources, speakers) + описание/инсайты
events/
  closed-chapters/*.json          # закрытая встреча: книга, глава, pages{from,to}, notes_board_url, call_url, materials[{title,url}]
  live-talks/*.json               # открытая встреча: streams{youtube,vk}, talks[{title, speaker, avatar}], registration_url, call_url, materials, book_id+chapter (программа — темы для заявок спикеров через бота)
media/
  covers/*.webp                   # обложки книг
  authors/*.webp                  # аватарки авторов
  speakers/*.webp                 # аватарки спикеров
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
