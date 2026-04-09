import express from 'express';
import auth from '../../common/middlewares/auth';
import validate from '../../common/middlewares/validate';
import categoryValidation from './category.validation';
import categoryController from './category.controller';

const router = express.Router();

router
  .route('/')
  .post(auth('superadmin', 'admin', 'librarian'), validate(categoryValidation.createCategory), categoryController.createCategory)
  .get(validate(categoryValidation.getCategories), categoryController.getCategories);

router
  .route('/:categoryId')
  .get(validate(categoryValidation.getCategory), categoryController.getCategory)
  .patch(auth('superadmin', 'admin', 'librarian'), validate(categoryValidation.updateCategory), categoryController.updateCategory)
  .delete(auth('superadmin', 'admin', 'librarian'), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

export default router;
