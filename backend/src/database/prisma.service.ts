import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static getAdapter() {
    let host = process.env.DB_HOST || 'localhost';
    let port = parseInt(process.env.DB_PORT || '3306', 10);
    let user = process.env.DB_USER || 'root';
    let password = process.env.DB_PASSWORD || '';
    let database = process.env.DB_NAME || 'projects_master_db';

    // Parse DATABASE_URL if available to guarantee production compatibility with single env var
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      try {
        const url = new URL(databaseUrl);
        host = url.hostname;
        port = parseInt(url.port || '3306', 10);
        user = url.username;
        password = decodeURIComponent(url.password || '');
        database = url.pathname.replace(/^\//, '');
      } catch (err) {
        console.error('Error parsing DATABASE_URL in PrismaService:', err);
      }
    }

    return new PrismaMariaDb({
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 10,
    });
  }

  constructor() {
    super({
      adapter: PrismaService.getAdapter(),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
