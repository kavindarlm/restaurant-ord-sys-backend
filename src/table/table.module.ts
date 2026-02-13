import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { EncryptionService } from '../common/encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  controllers: [TableController],
  providers: [TableService, EncryptionService],
  exports: [EncryptionService],
})
export class TableModule {}
