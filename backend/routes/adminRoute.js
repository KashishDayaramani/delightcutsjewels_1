import express from 'express';
import { getDashboardData, getProductSales } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const adminRouter = express.Router();

adminRouter.post('/dashboard', adminAuth, getDashboardData);
adminRouter.post('/product-sales', adminAuth, getProductSales);

export default adminRouter;