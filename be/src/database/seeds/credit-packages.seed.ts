/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

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

const packages = [
  {
    name: 'Starter',
    credits: 50,
    price: 19000,
    validityDays: 30,
    isActive: true,
    description:
      'Thử nghiệm studio với 50 credits. Phù hợp cho người mới bắt đầu.',
  },
  {
    name: 'Basic',
    credits: 150,
    price: 49000,
    validityDays: 90,
    isActive: true,
    description: 'Gói phổ biến nhất. 150 credits, hiệu lực 3 tháng.',
  },
  {
    name: 'Pro',
    credits: 400,
    price: 99000,
    validityDays: 180,
    isActive: true,
    description:
      'Dành cho nhạc sĩ chuyên nghiệp. 400 credits, hiệu lực 6 tháng.',
  },
];

async function seed() {
  await dataSource.initialize();
  console.log('Database connected.');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const existing = await dataSource.query(
    `SELECT COUNT(*) as count FROM credit_packages`,
  );
  if (Number(existing[0].count) > 0) {
    console.log(`Already have ${existing[0].count} packages. Skipping seed.`);
    await dataSource.destroy();
    return;
  }

  for (const pkg of packages) {
    await dataSource.query(
      `INSERT INTO credit_packages (name, credits, price, "validityDays", "isActive", description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        pkg.name,
        pkg.credits,
        pkg.price,
        pkg.validityDays,
        pkg.isActive,
        pkg.description,
      ],
    );
    console.log(
      `Created package: ${pkg.name} (${pkg.credits} credits - ${pkg.price.toLocaleString()}đ)`,
    );
  }

  console.log('Seed completed.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
