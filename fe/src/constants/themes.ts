/**
 * Lyric style themes available for AI generation.
 * Each theme instructs the AI to write in the style of the selected artist.
 * Add or remove entries here to update the theme picker in the UI.
 */
export const LYRIC_THEMES = [
  { label: '🔥 V-Pop Trendy', value: 'TrendyPop', desc: "Hiện đại, cực 'suy' và bắt tai" },
  { label: '📖 Tự sự Đời thường', value: 'Acoustic', desc: 'Mộc mạc, gần gũi, sâu sắc' },
  { label: '💔 Ballad Da diết', value: 'Nostalgic', desc: 'U buồn, chạm đến cảm xúc' },
  { label: '🕊️ Triết lý', value: 'Philosophical', desc: 'Suy ngẫm về thân phận' },
] as const;
