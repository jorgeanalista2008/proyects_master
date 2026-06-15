import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static getAdapter() {
    const isProd = process.env.NODE_ENV === 'production';
    
    // Si es producción, usamos los parámetros de Hostinger
    const host = isProd ? 'srv1609.hstgr.io' : (process.env.DB_HOST || 'localhost');
    const port = isProd ? 3306 : parseInt(process.env.DB_PORT || '3306', 10);
    const user = isProd ? 'u646234231_proyects' : (process.env.DB_USER || 'root');
    const password = isProd ? 'Proyects.8826##' : (process.env.DB_PASSWORD || '');
    const database = isProd ? 'u646234231_proyects' : (process.env.DB_NAME || 'projects_master_db');

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
