# Добавление встречи

Создай новую встречу клуба. Выполни шаги:

1. Спроси тип встречи (open-talk / closed-chapter)
2. Спроси дату, время, тему
3. Создай файл в `events/{тип}/{дата}-{тема}.json`
4. Поля: title, type, date, time, timezone, chapter (для closed), stream_links (для open), registration_url
5. Проверь формат даты (YYYY-MM-DD)