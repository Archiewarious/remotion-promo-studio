---
description: Склейка/заморозка утверждённых сцен (без перерендера)
argument-hint: -Clips a.mp4,b.mp4 [-Target 3840x2160] [-Voice public\voice.mp3]
---
Из папки проекта запусти склейку: `powershell -File ../scripts/concat.ps1 $ARGUMENTS`. Без `-Target` = stream-copy (быстро, одинаковое разрешение); с `-Target` = lanczos-upscale + ре-энкод; с `-Voice` = домешать голос. Утверждённые сцены НЕ перерендеривать — только так.
