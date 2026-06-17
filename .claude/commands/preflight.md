---
description: Pre-flight: длительность, чёрные кадры, фриз, громкость
argument-hint: [файл] [-LUFS -14] [-ExpectSec N]
---
Из папки проекта прогони pre-flight: `powershell -File ../scripts/preflight.ps1 -File <файл>` — где `<файл>` = "$ARGUMENTS" или, если пусто, последний `out/v*_*.mp4`. Покажи вывод и разбери каждое `[WARN]` (громкость не та → `/mix`; чёрные/фриз → к сцене).
