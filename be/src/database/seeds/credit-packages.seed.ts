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

/**
 * Gói credits theo CREDITS.MD (tỷ giá 1 USD ≈ 25,000 VND, 100 credits = 4 USD = 99,000đ)
 * Bonus credits tăng theo gói để khuyến khích mua nhiều hơn.
 */
// Tỷ lệ: 100 credits = 4 USD = 99,000 VND (1 USD ≈ 25,000 VND)
// Bonus credits tăng theo gói để khuyến khích mua nhiều hơn.
const packages = [
  {
    name: 'Starter',
    credits: 100,
    price: 99000,
    priceUsd: 4,
    validityDays: 30,
    isActive: true,
    description:
      'Thử nghiệm studio với 100 credits. Phù hợp cho người mới bắt đầu.',
  },
  {
    name: 'Boost',
    credits: 275, // 250 base + 25 bonus
    price: 229000,
    priceUsd: 10,
    validityDays: 90,
    isActive: true,
    description:
      'Gói phổ biến. 250 credits + 25 bonus = 275 credits, hiệu lực 3 tháng.',
  },
  {
    name: 'Pro',
    credits: 575, // 500 base + 75 bonus
    price: 399000,
    priceUsd: 18,
    validityDays: 180,
    isActive: true,
    description:
      'Dành cho nhạc sĩ chuyên nghiệp. 500 credits + 75 bonus = 575 credits, hiệu lực 6 tháng.',
  },
  {
    name: 'Ultra',
    credits: 1200, // 1000 base + 200 bonus
    price: 749000,
    priceUsd: 34,
    validityDays: 365,
    isActive: true,
    description:
      'Gói cao cấp nhất. 1000 credits + 200 bonus = 1200 credits, hiệu lực 1 năm.',
  },
];

async function seed() {
  await dataSource.initialize();
  console.log('Database connected.');

  // Upsert by name: UPDATE if exists, INSERT if not
  for (const pkg of packages) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const existing = await dataSource.query(
      `SELECT id FROM credit_packages WHERE name = $1 LIMIT 1`,
      [pkg.name],
    );

    if (existing.length > 0) {
      await dataSource.query(
        `UPDATE credit_packages
         SET credits=$1, price=$2, "priceUsd"=$3, "validityDays"=$4, "isActive"=$5, description=$6
         WHERE name=$7`,
        [
          pkg.credits,
          pkg.price,
          pkg.priceUsd,
          pkg.validityDays,
          pkg.isActive,
          pkg.description,
          pkg.name,
        ],
      );
      console.log(
        `Updated: ${pkg.name} (${pkg.credits} credits - ${pkg.price.toLocaleString()}d / $${pkg.priceUsd})`,
      );
    } else {
      await dataSource.query(
        `INSERT INTO credit_packages (name, credits, price, "priceUsd", "validityDays", "isActive", description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          pkg.name,
          pkg.credits,
          pkg.price,
          pkg.priceUsd,
          pkg.validityDays,
          pkg.isActive,
          pkg.description,
        ],
      );
      console.log(
        `Inserted: ${pkg.name} (${pkg.credits} credits - ${pkg.price.toLocaleString()}d / $${pkg.priceUsd})`,
      );
    }
  }

  // Deactivate old packages not in the new list
  const newNames = packages.map((p) => p.name);
  await dataSource.query(
    `UPDATE credit_packages SET "isActive" = false WHERE name != ALL($1)`,
    [newNames],
  );
  console.log('Deactivated packages not in current list.');

  console.log('Seed completed.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
