/**
 * AI model identifiers used when calling the generation API.
 * Update these when upgrading to newer model versions.
 */
export const AI_MODELS = {
  /** Gemini Thinking model — higher quality, slower, costs more credits */
  THINKING: 'gemini-2.5-pro-preview-06-05',
  /** Gemini Flash model — default, fast and cost-effective */
  DEFAULT: 'gemini-2.5-flash',
} as const;

/**
 * Max output tokens sent to the API per request type.
 * Higher values = longer output = more credits consumed.
 */
export const AI_MAX_TOKENS = {
  /** Full lyric generation / rewrite */
  LYRICS_GENERATION: 2048,
  /** Theme & story detection from lyrics */
  THEME_DETECTION: 512,
} as const;
