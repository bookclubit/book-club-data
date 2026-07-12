---
id: docker-intro-1-3
title: Жизненный цикл контейнера
order: 3
video_youtube: ""
video_vk: ""
presentation: ""
resources: []
speakers:
  - Антон
---

## Краткое описание

Состояния контейнера: created, running, paused, stopped, deleted. Команды `docker run`, `docker stop`, `docker start`, `docker rm`. Что происходит на каждом этапе.

## Инсайты

- `docker run` = `docker create` + `docker start` + `docker attach` (если не `-d`).
- Остановленный контейнер сохраняет изменения файловой системы, но не состояние процессов.

## Мнение спикера

**Антон:** Частая ошибка новичков: перезапускать контейнер через `docker run` вместо `docker start`. Так создаётся новый контейнер.
