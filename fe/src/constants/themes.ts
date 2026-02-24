/**
 * Lyric style themes available for AI generation.
 * Each theme instructs the AI to write in the style of the selected artist.
 * Add or remove entries here to update the theme picker in the UI.
 */
export const LYRIC_THEMES = [
  { label: '✨ Tự động', value: '', desc: 'Giữ nguyên linh hồn bản gốc' },
  { label: '🕊️ Trịnh Công Sơn', value: 'Trịnh Công Sơn', desc: 'Triết lý, hư vô, thiền vị' },
  { label: '🎻 Ngô Thụy Miên', value: 'Ngô Thụy Miên', desc: 'Trữ tình, lãng mạn cổ điển' },
  { label: '🎸 Lam Phương', value: 'Lam Phương', desc: 'Hoài niệm, Bolero, sâu sắc' },
  { label: '🌃 Phú Quang', value: 'Phú Quang', desc: 'Hà Nội, phố cũ, nỗi nhớ' },
  { label: '📖 Phan Mạnh Quỳnh', value: 'Phan Mạnh Quỳnh', desc: 'Tự sự, mộc mạc, đời thường' },
  { label: '📝 Đen Vâu', value: 'Đen Vâu', desc: 'Ẩn dụ, phóng khoáng, tự tại' },
  { label: '🌿 Vũ. (Indie)', value: 'Vũ. Indie', desc: 'Indie Pop, buồn nhẹ nhàng' },
  { label: '💔 Mr. Siro', value: 'Mr. Siro', desc: 'Ballad thất tình, đau đớn' },
  { label: '📱 Sơn Tùng M-TP', value: 'Sơn Tùng M-TP', desc: 'Pop hiện đại, catchy, trendy' },
  { label: '🍎 Táo (Melodic)', value: 'Táo Melodic', desc: 'Melodic Rap, nội tâm, tối' },
  { label: '✨ Hứa Kim Tuyền', value: 'Hứa Kim Tuyền', desc: 'Nhạc Pop văn minh, cảm xúc' },
] as const;
