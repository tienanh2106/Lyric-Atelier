export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRATION || '10m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '1d',
  },

  genai: {
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
    // Default model used for server-side generation (scenario suggestions, media-to-text)
    defaultModel: process.env.GENAI_DEFAULT_MODEL ?? 'gemini-2.5-flash',
    // Thinking model used for higher-quality lyric rewriting (useThinking: true)
    thinkingModel:
      process.env.GENAI_THINKING_MODEL ?? 'gemini-2.5-pro-preview-06-05',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },

  payos: {
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  },

  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  credits: {
    defaultValidityDays: parseInt(
      process.env.DEFAULT_CREDIT_VALIDITY_DAYS ?? '90',
      10,
    ),
    costPerToken: parseFloat(process.env.CREDIT_COST_PER_TOKEN ?? '0.01'),
    transcribeCostFixed: parseInt(
      process.env.TRANSCRIBE_CREDIT_COST ?? '10',
      10,
    ),
    expiringSoonDays: parseInt(
      process.env.CREDITS_EXPIRING_SOON_DAYS ?? '7',
      10,
    ),
    // Token estimation: ~4 characters = 1 token (rough estimation)
    charsPerToken: parseInt(process.env.CREDIT_CHARS_PER_TOKEN ?? '4', 10),
    // Extra token buffer reserved for scenario suggestion responses (longer output)
    scenarioBufferTokens: parseInt(
      process.env.CREDIT_SCENARIO_BUFFER_TOKENS ?? '1000',
      10,
    ),
    // Fixed token estimate for media-to-text (audio/video processing)
    mediaEstimatedTokens: parseInt(
      process.env.CREDIT_MEDIA_ESTIMATED_TOKENS ?? '2000',
      10,
    ),
  },

  cronSecret: process.env.CRON_SECRET,

  allowedOrigins: process.env.ALLOWED_ORIGINS,
});
