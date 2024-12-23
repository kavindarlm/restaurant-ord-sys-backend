import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity'; // Correct import for Table
import * as QRCode from 'qrcode';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto) {
    try {
      const table = this.tableRepository.create(createTableDto);
      // Ensure the name is set correctly
      table.table_name = createTableDto.table_name || 'New Table';
      await this.tableRepository.save(table);

      // Generate QR code for the table
      const qrData = `http://localhost:3000/hotelMenuPageCustomer/${table.table_id}`;
      const qrCode = await QRCode.toDataURL(qrData);

      // Save the QR code URL to the table
      table.qr_code = qrCode;
      await this.tableRepository.save(table);
      console.log("This is the table data" + table);

      return table;
    } catch (e) {
      console.log(e);
    }
  }

  async findAll() {
    return await this.tableRepository.find();
  }

  async findOne(id: number) {
    const table = await this.tableRepository.findOne({ where: { table_id: id } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`); // Use NotFoundException
    }
    return table;
  }

  async update(id: number, updateTableDto: UpdateTableDto) {
    const table = await this.tableRepository.findOne({ where: { table_id: id } });
    if (!table) {
      throw new Error(`Table with ID ${id} not found`);
    }
    Object.assign(table, updateTableDto);
    return await this.tableRepository.save(table);
  }

  async remove(id: number) {
    const result = await this.tableRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Table with ID ${id} not found`);
    }
    return { message: 'Table deleted successfully' };
  }
}
