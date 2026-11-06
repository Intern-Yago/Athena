import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { DatabaseService, Category } from '../database/database.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  getAll(): Category[] {
    return this.db.getCategories();
  }

  @Post()
  create(@Body() body: Category): Category {
    const newCategory: Category = {
      ...body,
      id: body.id || `cat_${Date.now()}`
    };
    return this.db.createCategory(newCategory);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const success = this.db.deleteCategory(id);
    return { success, id };
  }
}
