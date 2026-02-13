import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { EncryptionService } from '../common/encryption.service';

@Controller('table')
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly encryptionService: EncryptionService,
  ) {}

  @Post()
  create(@Body() createTableDto: CreateTableDto) {
    return this.tableService.create(createTableDto);
  }

  @Get()
  findAll() {
    return this.tableService.findAll();
  }

  // Admin endpoint - numeric ID
  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.tableService.findOne(+id);
  }

  // Customer-facing endpoint - encrypted ID validation
  @Get('secure/:encryptedId')
  async findTableByEncryptedId(@Param('encryptedId') encryptedId: string) {
    try {
      const tableId = this.encryptionService.decrypt(encryptedId);
      return await this.tableService.findOne(tableId);
    } catch (error) {
      throw new BadRequestException('Invalid table identifier');
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    return this.tableService.update(+id, updateTableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tableService.remove(+id);
  }
}
