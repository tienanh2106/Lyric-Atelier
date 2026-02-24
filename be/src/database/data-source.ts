import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const databaseUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource(
  databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        ssl: { rejectUnauthorized: false },
        entities: ['src/**/*.entity.ts'],
        migrations: ['src/database/migrations/*.ts'],
        synchronize: false,
        logging: true,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_DATABASE ?? 'lyric_atelier',
        entities: ['src/**/*.entity.ts'],
        migrations: ['src/database/migrations/*.ts'],
        synchronize: false,
        logging: true,
      },
);
