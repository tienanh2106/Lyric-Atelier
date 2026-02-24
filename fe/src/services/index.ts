export { axiosInstance } from './custom-instance';
export { queryClient } from './queryClient';

// API-based services
export { rewriteLyricsWithAPI } from './lyricGenerationService';
export {
  generateRandomScenarioWithAPI,
  uploadAndExtractLyrics,
  detectThemeAndStoryWithAPI,
} from './lyricHelperService';
