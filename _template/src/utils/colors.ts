// ⚠️ НЕЙТРАЛЬНЫЙ ДЕФОЛТ — ЗАМЕНИТЬ ПОД БРЕНД КЛИЕНТА (accent + bgA/B/C).
export const C = {
  bgA:       '#222a38',  // фон: центр градиента (светлее)
  bgB:       '#141a24',  // фон: середина
  bgC:       '#080b11',  // фон: тёмный край
  accent:    '#6E8BFF',  // ← ГЛАВНЫЙ АКЦЕНТ. Поменять на бренд-цвет.
  accentDim: 'rgba(110,139,255,0.65)',
  white:     '#FFFFFF',
  cream:     '#F4F6FA',
  textDim:   'rgba(255,255,255,0.72)',
  overlay:   'rgba(0,0,0,0.40)',
} as const;
export type ColorKey = keyof typeof C;
