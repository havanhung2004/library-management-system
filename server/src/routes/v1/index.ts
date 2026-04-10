import express from 'express';
import authRoute from '../../modules/auth/auth.route';
import bookRoute from '../../modules/book/book.route';
import categoryRoute from '../../modules/book/category.route';
import documentRoute from '../../modules/book/document.route';
import userRoute from '../../modules/user/user.route';
import notificationRoute from '../../modules/notification/notification.route';
import loanRoute from '../../modules/loan/loan.route';
import aiRoute from '../../modules/ai/ai.route';
import dashboardRoute from '../../modules/dashboard/dashboard.route';
import fineRoute from '../../modules/fine/fine.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/books',
    route: bookRoute,
  },
  {
    path: '/categories',
    route: categoryRoute,
  },
  {
    path: '/loans',
    route: loanRoute,
  },
  {
    path: '/documents',
    route: documentRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/ai',
    route: aiRoute,
  },
  {
    path: '/dashboard',
    route: dashboardRoute,
  },
  {
    path: '/fines',
    route: fineRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
