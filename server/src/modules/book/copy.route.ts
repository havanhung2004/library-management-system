import express from 'express';
import auth from '../../common/middlewares/auth';
import validate from '../../common/middlewares/validate';
import copyValidation from './copy.validation';
import copyController from './copy.controller';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(auth('superadmin', 'admin', 'librarian'), validate(copyValidation.createCopy), copyController.createCopy)
  .get(auth('superadmin', 'admin', 'librarian'), validate(copyValidation.getCopies), copyController.getCopies);

router
  .route('/:copyId')
  .patch(auth('superadmin', 'admin', 'librarian'), validate(copyValidation.updateCopy), copyController.updateCopy)
  .delete(auth('superadmin', 'admin', 'librarian'), validate(copyValidation.deleteCopy), copyController.deleteCopy);

export default router;
