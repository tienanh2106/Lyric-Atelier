import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const databaseUrl = configService.get<string>('database.url');
        const isProduction =
          configService.get<string>('nodeEnv') === 'production';

        const ssl = isProduction ? { rejectUnauthorized: false } : false;
        const common = {
          type: 'postgres' as const,
          ssl,
          autoLoadEntities: true,
          synchronize: false,
          logging: !isProduction,
          migrationsRun: false,
          retryAttempts: 5,
          retryDelay: 3000,
        };

        if (databaseUrl) {
          return { ...common, url: databaseUrl };
        }

        return {
          ...common,
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.database'),
        };
      },
    }),
  ],
})
export class DatabaseModule {}
