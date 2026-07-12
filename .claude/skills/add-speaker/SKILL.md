---
name: add-speaker
description: Добавить спикера — оптимизировать аватарку в WebP и положить в media/speakers/ с корректным speaker_id. Использовать, когда просят добавить спикера/докладчика или его аватарку.
---

# Добавление спикера

Заводит аватарку спикера и его `speaker_id` для использования в открытых встречах (`add-event`).

## Что спросить (если не указано)

- Имя и фамилия спикера
- Файл или ссылка на аватарку (jpg / png / avif / webp)

## Шаги

1. `speaker_id` — kebab-case из имени, формат `<фамилия>-<имя>` (напр. `pomazkov-anton`). Транслит с русского.
2. Аватарку конвертируй в WebP и сохрани как `media/speakers/<speaker_id>.webp`:
   ```bash
   # если нет конвертера — поставь sharp во временной папке-скретчпаде (НЕ в репозитории):
   npm install sharp
   node -e "require('sharp')('IN').resize({width:400,height:400,fit:'cover',position:'attention',withoutEnlargement:true}).webp({quality:82}).toFile('media/speakers/<speaker_id>.webp')"
   ```
   Итог — квадрат 400×400, WebP ≤200KB. Оригинал (jpg/png/avif) в репозиторий не коммить.
3. Скачивание по URL — при необходимости с полным `User-Agent` (некоторые CDN блокируют дефолтный).
4. Проверь, что файл — валидный WebP и ≤200KB.
5. Коммит: `feat(media): добавить аватарку спикера <Имя Фамилия>`. Не пушить.

## Как использовать дальше

В открытой встрече (`add-event`, `live-talk`) ссылайся на спикера так:

```json
{
  "speaker": "Имя Фамилия",
  "speaker_id": "<speaker-id>",
  "avatar": "/media/speakers/<speaker-id>.webp"
}
```

Аватарки авторов книг живут отдельно — в `media/authors/` (заводятся скиллом `add-book`).
