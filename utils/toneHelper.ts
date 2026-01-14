export const getToneOfWord = (word: string): string => {
  if (!word) return 'Ngang';
  const lowercase = word.toLowerCase().normalize('NFC');

  if (/[áéíóúýắếốớứ]/.test(lowercase)) return 'Sắc';
  if (/[àèìòùỳằềồờừ]/.test(lowercase)) return 'Huyền';
  if (/[ảẻỉỏủỷẳểổởử]/.test(lowercase)) return 'Hỏi';
  if (/[ãẽĩõũỹẵễỗỡữ]/.test(lowercase)) return 'Ngã';
  if (/[ạẹịọụỵặệộợự]/.test(lowercase)) return 'Nặng';

  return 'Ngang';
};

export const getToneSymbol = (tone: string): string => {
  switch (tone) {
    case 'Sắc':
      return '´';
    case 'Huyền':
      return '`';
    case 'Hỏi':
      return '?';
    case 'Ngã':
      return '~';
    case 'Nặng':
      return '.';
    default:
      return '—';
  }
};

export const getTonePattern = (line: string): string[] => {
  return line
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map(getToneOfWord);
};
