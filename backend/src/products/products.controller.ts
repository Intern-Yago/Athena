import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DatabaseService, Product } from '../database/database.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  getAll(): Product[] {
    return this.db.getProducts();
  }

  @Post()
  create(@Body() body: Product): Product {
    const newProduct: Product = {
      ...body,
      id: body.id || `prod_${Date.now()}`
    };
    return this.db.createProduct(newProduct);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Product>): Product {
    return this.db.updateProduct(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const success = this.db.deleteProduct(id);
    return { success, id };
  }
}
