---
description: Один кадр → PNG (быстрая vision-проверка / пре-рендер статики)
argument-hint: <frame> [Comp=Main]
---
Из папки проекта отрендери кадр и сразу посмотри: `npx remotion still src/index.ts <Comp|Main> out/f$ARGUMENTS.png --frame=<frame> --gl=angle-egl` → прочитай PNG через Read и оцени. 
Для пре-рендера тяжёлого статичного фона (`BrandBG` с 12 градиентами/blur): сделай BG-only композицию, сохрани её кадр в `public/bg.png`, дальше используй `<Img src={staticFile('bg.png')}/>` вместо живого фона — экономит GPU на рендере.
