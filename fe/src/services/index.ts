export { axiosInstance } from './custom-instance';
export { queryClient } from './queryClient';

// API-based services
export { rewriteLyricsWithAPI } from './lyricGenerationService';
export {
  generateRandomScenarioWithAPI,
  uploadMediaFile,
  extractLyricsFromMediaWithAPI,
  uploadAndExtractLyrics,
  detectThemeAndStoryWithAPI,
} from './lyricHelperService';
