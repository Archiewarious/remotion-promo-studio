---
description: Финальный звук — голос+музыка (ducking) до целевого LUFS
argument-hint: -Video out\v1_final.mp4 -Music public\music.mp3 [-LUFS -14]
---
Из папки проекта запусти микс: `powershell -File ../scripts/mix.ps1 $ARGUMENTS`. По умолчанию `voice=public/voice.mp3`, целевой LUFS — из `_env.ps1` (YouTube −14 / Instagram −16). Музыка авто-приглушается под голос. После микса preflight прогонится сам.
