/**
 * Credit cost configuration for all AI operations.
 *
 * Dynamic operations: cost = max(MIN_COST, baseCost + ceil(wordCount × ratePerWord))
 * Fixed operations:   cost = fixed  (always >= MIN_COST)
 *
 * Audio word-count estimate: estimatedWords = ceil(fileSizeMB × AUDIO_WORDS_PER_MB)
 * Text word count: lyrics.split(/\s+/).filter(Boolean).length
 */
export const CREDIT_CONFIG = {
  /** Floor — no operation ever costs less than this */
  MIN_COST: 5,

  /**
   * Estimated sung words per MB of audio.
   * Based on: avg Vietnamese song ≈ 50 sung words/min, MP3 128kbps ≈ 1 MB/min.
   */
  AUDIO_WORDS_PER_MB: 50,

  // ── Dynamic (scaled by word count) ──────────────────────────────────────

  /**
   * transcribeAudio (Gemini Flash multimodal, audio inline).
   * 100-word song  → max(5, 5 + 5)  = 10 credits
   * 200-word song  → max(5, 5 + 10) = 15 credits
   * 400-word song  → max(5, 5 + 20) = 25 credits
   */
  transcribeAudio: { baseCost: 5, ratePerWord: 0.05 },

  /**
   * syncKaraoke (Gemini Flash + Whisper parallel — 2 API calls).
   * 100-word song  → max(5, 8 + 8)  = 16 credits
   * 200-word song  → max(5, 8 + 16) = 24 credits
   * 400-word song  → max(5, 8 + 32) = 40 credits
   */
  syncKaraoke: { baseCost: 8, ratePerWord: 0.08 },

  /**
   * rewriteLyrics standard (Gemini Flash, long structured JSON output).
   * 100-word lyrics → max(5, 5 + 10) = 15 credits
   * 200-word lyrics → max(5, 5 + 20) = 25 credits
   * 400-word lyrics → max(5, 5 + 40) = 45 credits
   */
  rewriteLyrics: { baseCost: 5, ratePerWord: 0.1 },

  /**
   * rewriteLyrics with thinking model (Gemini Pro thinking — premium quality).
   * 100-word lyrics → max(5, 10 + 20) = 30 credits
   * 200-word lyrics → max(5, 10 + 40) = 50 credits
   * 400-word lyrics → max(5, 10 + 80) = 90 credits
   */
  rewriteLyricsThinking: { baseCost: 10, ratePerWord: 0.2 },

  /**
   * detectTheme (Gemini Flash, short JSON output).
   * 100-word lyrics → max(5, 2 + 2) = 5 credits (min)
   * 200-word lyrics → max(5, 2 + 4) = 6 credits
   * 500-word lyrics → max(5, 2 + 10) = 12 credits
   */
  detectTheme: { baseCost: 2, ratePerWord: 0.02 },

  // ── Fixed (no scaling metric available) ─────────────────────────────────

  /** scenarioFromTheme — input is just a theme string (a few words) */
  scenarioFromTheme: { fixed: 5 },

  /** generateContent — generic short prompt */
  generateContent: { fixed: 5 },

  /** suggestScenario — produces multiple detailed suggestions */
  suggestScenario: { fixed: 10 },

  /** mediaToText — URL-based, no file to measure */
  mediaToText: { fixed: 15 },
} as const;

/** Compute dynamic cost: max(MIN_COST, baseCost + ceil(wordCount × ratePerWord)) */
export function calcDynamicCost(
  cfg: { baseCost: number; ratePerWord: number },
  wordCount: number,
): number {
  return Math.max(
    CREDIT_CONFIG.MIN_COST,
    cfg.baseCost + Math.ceil(wordCount * cfg.ratePerWord),
  );
}

/** Count words in a text string */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Estimate word count from audio file size (bytes) */
export function estimateAudioWords(fileSizeBytes: number): number {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  return Math.ceil(fileSizeMB * CREDIT_CONFIG.AUDIO_WORDS_PER_MB);
}
