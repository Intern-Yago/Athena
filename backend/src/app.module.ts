import { Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { CategoriesController } from './categories/categories.controller';
import { BrandsController } from './brands/brands.controller';
import { ProductsController } from './products/products.controller';

@Module({
  imports: [],
  controllers: [CategoriesController, BrandsController, ProductsController],
  providers: [DatabaseService],
})
export class AppModule {}
