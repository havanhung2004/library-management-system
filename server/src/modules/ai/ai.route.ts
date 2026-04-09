import express from 'express';
import aiController from './ai.controller';
import auth from '../../common/middlewares/auth';

const router = express.Router();

// Tất cả các tính năng AI yêu cầu đăng nhập
router.use(auth());

router.post('/chat', aiController.chat);
router.post('/recommendations', aiController.getRecommendations);

export default router;
