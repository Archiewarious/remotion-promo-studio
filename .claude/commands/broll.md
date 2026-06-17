---
description: Поиск и скачивание b-roll в общую библиотеку по категориям
argument-hint: "query1" "query2" … [--count 5] [--min-fps 60] [--size large] [--orientation portrait] [--max-height 2160] [--source both]
---
Из корня воркспейса: `py scripts/broll.py $ARGUMENTS`. Ищет видео в Pexels/Pixabay, качает лучшие клипы в `_ASSETS/broll/<категория>/` (категория = запрос), имя файла = описание содержимого + разрешение + id, метаданные пишутся в `_ASSETS/broll/_index.json`.

Подсказки:
- Запросы — на английском (сток размечен по-английски: лучше результаты + латинские папки). Несколько категорий за раз: `"sunset" "food" "cars"`.
- `--dry-run` — показать кандидатов без скачивания (удобно «подбирать»). По умолчанию 1080p; `--max-height 2160` для 4K; `--orientation portrait` для Reels.
- **Фильтр fps:** `--min-fps 60` — только клипы, у которых ЕСТЬ ≥60fps-версия (Pexels API fps не фильтрует → over-fetch + отсев по `video_files.fps`; «60fps» в запрос писать НЕ надо). ⚠️ 60fps-стока мало (~5%), `count` может не набраться. `--size large` = только 4K (серверный фильтр Pexels).
- Для проекта: переиспользуй из библиотеки → скопируй нужное в `public/` и приведи к 30fps (`ffmpeg -i in -r 30 out`).
