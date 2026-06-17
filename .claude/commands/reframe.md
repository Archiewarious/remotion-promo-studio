---
description: Реформат 16:9-мастера в соц-форматы (9:16 Reels/Shorts, 1:1)
argument-hint: -File out\v1_final_4k.mp4 [-To 9x16|1x1|both] [-Mode blur|crop]
---
Из папки проекта: `powershell -File ../scripts/reframe.ps1 $ARGUMENTS`. Делает вертикаль/квадрат из 16:9-мастера: `blur` (по умолчанию) = размытый фон-cover + вписанное видео без обрезки; `crop` = центральный кроп под формат. Выход 1080-широкий, версионируется. Звук переносится.
