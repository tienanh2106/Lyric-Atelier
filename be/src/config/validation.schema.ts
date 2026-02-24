import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),

  // DATABASE_URL takes priority over individual DB vars (used in production/Vercel)
  DATABASE_URL: Joi.string().optional(),
  DB_HOST: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DB_PORT: Joi.number().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DB_USERNAME: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DB_PASSWORD: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DB_DATABASE: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),

  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRATION: Joi.string().required(),

  GOOGLE_GENAI_API_KEY: Joi.string().required(),
  GROQ_API_KEY: Joi.string().optional(),

  PAYOS_CLIENT_ID: Joi.string().optional(),
  PAYOS_API_KEY: Joi.string().optional(),
  PAYOS_CHECKSUM_KEY: Joi.string().optional(),

  FRONTEND_URL: Joi.string().optional(),

  DEFAULT_CREDIT_VALIDITY_DAYS: Joi.number().default(90),
  CREDIT_COST_PER_TOKEN: Joi.number().default(0.01),

  CRON_SECRET: Joi.string().optional(),

  // Comma-separated list of allowed CORS origins (e.g. https://app.com,https://www.app.com)
  ALLOWED_ORIGINS: Joi.string().optional(),
});
