---
name: add-book
description: Добавить новую книгу в клуб — создать папку books/<slug>/, meta.json, скачать и оптимизировать обложку в WebP, оформить авторов с аватарками. Использовать, когда просят добавить/завести книгу.
---

# Добавление книги

Заводит новую книгу целиком. Спроси недостающее, затем выполни все шаги без ручных действий пользователя.

## Что спросить (если не указано)

- Название (рус.) и оригинальное название
- Авторы (список)
- Издание (число)
- Ссылка на обложку (URL) или файл; можно ISBN — тогда обложку тянем с O'Reilly
- Теги, краткое описание, число глав, статус (`planned` / `reading` / `finished`)

## Шаги

1. Slug книги — kebab-case (обычно из оригинального названия), папка `books/<slug>/`.
2. Создай `books/<slug>/meta.json`:
   ```json
   {
     "id": "<book-id>",
     "title": "…",
     "title_original": "…",
     "edition": 1,
     "authors": [{ "name": "…", "avatar": "/media/authors/<autor-slug>.webp" }],
     "status": "planned",
     "cover": "/media/covers/<book-id>.webp",
     "tags": ["…"],
     "description": "…",
     "total_chapters": 0
   }
   ```
   `id` — короткий kebab-case идентификатор книги (используется в событиях и id карточек).
3. Обложка → `media/covers/<book-id>.webp`:
   - O'Reilly: `https://www.oreilly.com/covers/urn:orm:book:<ISBN>/296w/?format=webp` (обязательно полный `User-Agent` и `Referer: https://www.oreilly.com/`, иначе Akamai отдаёт Access Denied).
   - Любой источник → конвертируй в WebP (см. «Конвертация изображений»), сохраняя пропорции обложки (без кропа).
4. Аватарки авторов → `media/authors/<autor-slug>.webp` (см. «Конвертация изображений», квадрат 400×400). Если файлов пока нет — оставь путь в `meta.json` как договорённость и предупреди, что картинку надо добавить позже.
5. Проверь: `JSON.parse` для `meta.json`, что все пути картинок резолвятся, `npx prettier --check` по новым файлам.
6. Коммит: `feat(books): добавить книгу "<Название>"`. Не пушить (только по явной просьбе).

## Конвертация изображений

В системе может не быть конвертера WebP. Используй `sharp` (умеет jpg/png/avif → webp):

```bash
# один раз, во временной папке-скретчпаде (НЕ в репозитории):
npm install sharp
# аватар (квадрат):
node -e "require('sharp')('IN').resize({width:400,height:400,fit:'cover',position:'attention',withoutEnlargement:true}).webp({quality:82}).toFile('OUT')"
# обложка (сохранить пропорции):
node -e "require('sharp')('IN').resize({width:400,withoutEnlargement:true}).webp({quality:80}).toFile('OUT')"
```

Итог всегда WebP ≤200KB. Оригиналы (jpg/png/avif) в репозиторий не коммить.

## Связанные скиллы

После книги: `add-chapter` (глава вместе с темами), `add-flashcards`.
