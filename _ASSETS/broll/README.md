# _ASSETS/broll — общая библиотека b-roll (на все проекты)

Наполняется `scripts/broll.py` (slash **`/broll`**). Один кэш стока на все проекты — сначала ищем здесь, потом качаем новое.

Структура: `<категория>/<описание>__<WxH>__<источник><id>.mp4` (категория = поисковый запрос).
- `_index.json` — каталог (описание, теги, автор, URL, разрешение, fps, длительность).
- `_CREDITS.txt` — атрибуция (Pexels просит указывать автора; Pixabay — CC0).
- `<категория>/_preview/*.jpg` — постеры-превью для отбора (флаг `--preview`).

## Как пользоваться
- **Что уже есть:** `py ../scripts/inventory.py --broll` (или открой `_index.json`).
- **Подобрать (без траты трафика):** `/broll "ocean waves" --count 8 --preview` → постеры в `_preview/` → посмотри → `/broll "ocean waves" --only <id,id>`.
- **Быстро докачать:** `/broll "sunset" "food" "cars"` (англ. запросы; `--orientation portrait` для Reels; `--max-height 2160` для 4K; `--min-duration 5`).
- **В проект:** скопируй нужный клип в `<Project>/public/` и приведи к **30fps** (`ffmpeg -i in -r 30 out`) — server-side рендер требует 30fps.

Источники: Pexels + Pixabay. Ключи — в корневом `.env` (`PEXELS_API_KEY`, `PIXABAY_API_KEY`).
