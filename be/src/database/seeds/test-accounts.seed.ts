/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

config();

const databaseUrl = process.env.DATABASE_URL;

const dataSource = new DataSource(
  databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        ssl: { rejectUnauthorized: false },
        entities: ['src/**/*.entity.ts'],
        synchronize: false,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_DATABASE ?? 'lyric_atelier',
        entities: ['src/**/*.entity.ts'],
        synchronize: false,
      },
);

const TEST_ACCOUNTS = [
  {
    email: 'test01@melodai.app',
    password: 'Melodai@Test01',
    fullName: 'Test User 01',
  },
  {
    email: 'test02@melodai.app',
    password: 'Melodai@Test02',
    fullName: 'Test User 02',
  },
  {
    email: 'test03@melodai.app',
    password: 'Melodai@Test03',
    fullName: 'Test User 03',
  },
  {
    email: 'test04@melodai.app',
    password: 'Melodai@Test04',
    fullName: 'Test User 04',
  },
  {
    email: 'test05@melodai.app',
    password: 'Melodai@Test05',
    fullName: 'Test User 05',
  },
  {
    email: 'test06@melodai.app',
    password: 'Melodai@Test06',
    fullName: 'Test User 06',
  },
  {
    email: 'test07@melodai.app',
    password: 'Melodai@Test07',
    fullName: 'Test User 07',
  },
  {
    email: 'test08@melodai.app',
    password: 'Melodai@Test08',
    fullName: 'Test User 08',
  },
  {
    email: 'test09@melodai.app',
    password: 'Melodai@Test09',
    fullName: 'Test User 09',
  },
  {
    email: 'test10@melodai.app',
    password: 'Melodai@Test10',
    fullName: 'Test User 10',
  },
];

const INITIAL_CREDITS = 100;
const EXPIRES_DAYS = 365;

async function seed() {
  await dataSource.initialize();
  console.log('Database connected.\n');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRES_DAYS);

  for (const account of TEST_ACCOUNTS) {
    // Check if already exists
    const existing = await dataSource.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [account.email],
    );

    if (existing.length > 0) {
      console.log(`[SKIP] ${account.email} already exists.`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(account.password, 10);

    // 1. Create user
    const userResult = await dataSource.query(
      `INSERT INTO users (email, password, "fullName", role, "isActive")
       VALUES ($1, $2, $3, 'user', true)
       RETURNING id`,
      [account.email, hashedPassword, account.fullName],
    );
    const userId: string = userResult[0].id;

    // 2. Create user_credit_summary
    await dataSource.query(
      `INSERT INTO user_credit_summary ("userId", "totalCredits", "usedCredits", "availableCredits", "expiredCredits", "lastUpdated")
       VALUES ($1, $2, 0, $2, 0, NOW())`,
      [userId, INITIAL_CREDITS],
    );

    // 3. Create credit_ledger entry (PURCHASE)
    await dataSource.query(
      `INSERT INTO credit_ledger ("userId", type, debit, credit, balance, description, "referenceId", "expiresAt", "isExpired")
       VALUES ($1, 'PURCHASE', 0, $2, $2, 'Test account initial credits', $3, $4, false)`,
      [userId, INITIAL_CREDITS, `test-seed-${account.email}`, expiresAt],
    );

    console.log(
      `[OK] Created: ${account.email} | ${account.password} | ${INITIAL_CREDITS} credits`,
    );
  }

  console.log('\n=== TEST ACCOUNTS ===');
  console.log('Email                     | Password          | Credits');
  console.log('--------------------------|-------------------|--------');
  for (const a of TEST_ACCOUNTS) {
    console.log(
      `${a.email.padEnd(26)}| ${a.password.padEnd(18)}| ${INITIAL_CREDITS}`,
    );
  }

  console.log('\nSeed completed.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
