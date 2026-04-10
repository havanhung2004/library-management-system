import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import categoryService from './category.service';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).send({
    success: true,
    data: category,
    message: 'Category created successfully',
  });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.query;
  const filter: any = {};
  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }
  
  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };
  const result = await categoryService.queryCategories(filter, options);
  res.send({
    success: true,
    data: result.results,
    meta: {
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      totalResults: result.totalResults,
    },
  });
});

const getCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(req.params.categoryId);
  if (!category) {
    res.status(404).send({ success: false, message: 'Category not found' });
    return;
  }
  res.send({
    success: true,
    data: category,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategoryById(req.params.categoryId, req.body);
  res.send({
    success: true,
    data: category,
    message: 'Category updated successfully',
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await categoryService.deleteCategoryById(req.params.categoryId);
  res.send({
    success: true,
    message: 'Category deleted successfully',
  });
});

export default {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
