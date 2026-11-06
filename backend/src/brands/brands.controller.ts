import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { DatabaseService, Brand } from '../database/database.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  getAll(): Brand[] {
    return this.db.getBrands();
  }

  @Post()
  create(@Body() body: Brand): Brand {
    const newBrand: Brand = {
      ...body,
      id: body.id || `brand_${Date.now()}`
    };
    return this.db.createBrand(newBrand);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const success = this.db.deleteBrand(id);
    return { success, id };
  }
}
