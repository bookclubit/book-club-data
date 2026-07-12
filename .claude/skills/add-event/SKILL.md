---
name: add-event
description: Добавить встречу клуба — закрытую (разбор главы) или открытую (эфир с докладами). Создаёт JSON в events/ по схеме. Использовать, когда просят добавить встречу/эвент/эфир/стрим/разбор главы.
---

# Добавление встречи

Два типа встреч. Спроси тип, затем заполни соответствующую схему.

## Что спросить (если не указано)

- Тип: `closed-chapter` (закрытая, разбор главы) или `live-talk` (открытая, доклады)
- Дата (`YYYY-MM-DD`), время, таймзона (по умолчанию `Europe/Moscow`), тема
- Для закрытой: книга, глава, страницы для чтения, ссылка на доску заметок
- Для открытой: ссылки на стримы (YouTube, VK), список докладов (тема + спикер), ссылка на регистрацию

## Шаги

1. Проверь формат даты — строго `YYYY-MM-DD`.
2. Имя файла: `events/<тип>/<YYYY-MM-DD>-<тема-slug>.json` (папки: `events/closed-chapters/`, `events/live-talks/`).
3. Закрытая встреча:
   ```json
   {
     "id": "closed-<дата>-<slug>",
     "type": "closed-chapter",
     "title": "…",
     "date": "2026-07-20",
     "time": "19:00",
     "timezone": "Europe/Moscow",
     "book_id": "<book-id>",
     "chapter": "<NN-глава>",
     "pages": { "from": 1, "to": 24 },
     "notes_board_url": "https://…"
   }
   ```
4. Открытая встреча:
   ```json
   {
     "id": "live-<дата>-<slug>",
     "type": "live-talk",
     "title": "…",
     "date": "2026-07-25",
     "time": "19:00",
     "timezone": "Europe/Moscow",
     "streams": { "youtube": "https://…", "vk": "https://…" },
     "talks": [
       {
         "title": "…",
         "speaker": "Имя Фамилия",
         "speaker_id": "<speaker-id>",
         "avatar": "/media/speakers/<speaker-id>.webp"
       }
     ],
     "registration_url": "https://…"
   }
   ```
5. Спикеров и их аватарки заводи скиллом `add-speaker` (нужен корректный `speaker_id` и файл аватарки).
6. Проверь `JSON.parse`, что аватарки спикеров резолвятся, `npx prettier --check`.
7. Коммит: `feat(events): добавить встречу <дата> "<Тема>"`. Не пушить.
