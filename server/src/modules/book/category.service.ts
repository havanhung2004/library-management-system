import Category from './category.model';
import Book from './book.model';
import { ICategory } from './book.interface';
import { ApiError } from '../../common/utils/ApiError';

const createCategory = async (categoryBody: ICategory) => {
  if (await Category.findOne({ name: categoryBody.name })) {
    throw new ApiError(400, 'Category name already exists');
  }
  return Category.create(categoryBody);
};

const queryCategories = async (filter: any, options: any) => {
  const { limit = 10, page = 1, sortBy = 'createdAt:desc' } = options;
  const skip = (page - 1) * limit;

  const [sortField, sortOrder] = sortBy.split(':');
  const sort: any = {};
  sort[sortField] = sortOrder === 'desc' ? -1 : 1;

  const categories = await Category.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalResults = await Category.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: categories,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const getCategoryById = async (id: string) => {
  return Category.findById(id);
};

const updateCategoryById = async (categoryId: string, updateBody: Partial<ICategory>) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  if (updateBody.name && (await Category.findOne({ name: updateBody.name, _id: { $ne: categoryId } }))) {
    throw new ApiError(400, 'Category name already exists');
  }
  Object.assign(category, updateBody);
  await category.save();
  return category;
};

const deleteCategoryById = async (categoryId: string) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Kiểm tra danh mục có còn sách thuộc danh mục này hay không
  const bookCount = await Book.countDocuments({ category: categoryId });
  if (bookCount > 0) {
    throw new ApiError(400, 'Không thể xóa danh mục vì danh mục này đang có sách.');
  }

  await category.deleteOne();
  return category;
};

export default {
  createCategory,
  queryCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
