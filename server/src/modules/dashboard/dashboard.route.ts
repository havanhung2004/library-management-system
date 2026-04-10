import express from 'express';
import auth from '../../common/middlewares/auth';
import dashboardController from './dashboard.controller';

const router = express.Router();

router.get('/public-stats', dashboardController.getPublicStats);
router.get('/', auth('superadmin', 'admin', 'librarian'), dashboardController.getDashboardStats);

export default router;
