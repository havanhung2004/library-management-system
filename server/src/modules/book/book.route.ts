import express from 'express';
import auth from '../../common/middlewares/auth';
import validate from '../../common/middlewares/validate';
import { uploadDocument, uploadImage } from '../../common/middlewares/upload';
import bookValidation from './book.validation';
import bookController from './book.controller';
import copyRoute from './copy.route';

const router = express.Router();

router.use('/:bookId/copies', copyRoute);

router
  .route('/')
  .post(auth('superadmin', 'admin', 'librarian'), validate(bookValidation.createBook), bookController.createBook)
  .get(bookController.getBooks);

router
  .route('/:bookId')
  .get(validate(bookValidation.getBook), bookController.getBook)
  .patch(auth('superadmin', 'admin', 'librarian'), validate(bookValidation.getBook), bookController.updateBook)
  .delete(auth('superadmin', 'admin', 'librarian'), validate(bookValidation.getBook), bookController.deleteBook);

router.post(
  '/:bookId/upload',
  auth('superadmin', 'admin', 'librarian'),
  validate(bookValidation.getBook),
  uploadDocument.single('document'),
  bookController.uploadDocument
);

router.post(
  '/:bookId/cover',
  auth('superadmin', 'admin', 'librarian'),
  validate(bookValidation.getBook),
  uploadImage.single('coverImage'),
  bookController.uploadCover
);

router.get(
  '/:bookId/document',
  auth(),
  bookController.getBookDocument
);

export default router;
