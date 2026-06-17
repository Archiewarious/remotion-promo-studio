---
description: Озвучка → durationInFrames (+ опц. субтитры Whisper)
argument-hint: public\voice.mp3 [--captions] [--language ru]
---
Из папки проекта запусти: `py ../scripts/voicetiming.py $ARGUMENTS`. Возьми `durationInFrames` из вывода и впиши в `Root.tsx`. С флагом `--captions` создаст `public/captions.json` в формате `@remotion/captions` + распечатает сегменты для тайминга сцен.
