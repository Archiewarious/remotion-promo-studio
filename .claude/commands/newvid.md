---
description: Новый видео-проект одной командой (скелет + junctions)
argument-hint: ProjectName (latin)
---
Из КОРНЯ воркспейса «Про видео» создай проект: `powershell -NoProfile -ExecutionPolicy Bypass -File newproject.ps1 $ARGUMENTS`.

Дальше:
1. Заполни `$ARGUMENTS/CLAUDE.md` (бренд, бриф, формат, длительность).
2. Бренд: `src/utils/colors.ts` + `src/utils/fonts.ts` + свой `public/logo_watermark.png` (логотип клиента — не из общих шаблонов).
3. Тайминг: `/timing public/voice.mp3` → `durationInFrames` в `Root.tsx`.
4. Процесс производства — навык `video-pipeline` (он подтянет правила и движок по мере надобности).
