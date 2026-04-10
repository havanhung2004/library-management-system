import express from 'express';
import auth from '../../common/middlewares/auth';
import fineController from './fine.controller';

const router = express.Router();

router.get('/my-fines', auth(), fineController.getMyFines);
router.post('/pay/:fineId', auth(), fineController.payFine);

router.get('/', auth('admin', 'librarian', 'superadmin'), fineController.getFines);

export default router;
