import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // Conecta ao banco de dados quando o módulo é inicializado
    await this.$connect();
  }

  async onModuleDestroy() {
    // Desconecta do banco quando a aplicação é encerrada
    await this.$disconnect();
  }
}