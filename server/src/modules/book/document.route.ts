import express from 'express';
import auth from '../../common/middlewares/auth';
import documentController from './document.controller';

const router = express.Router();

router
  .route('/')
  .get(auth('superadmin', 'admin', 'librarian'), documentController.getDocuments);

router
  .route('/:documentId')
  .delete(auth('superadmin', 'admin'), documentController.deleteDocument);

export default router;
