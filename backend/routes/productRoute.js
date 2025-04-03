import express from 'express';
import { 
  listProducts, 
  addProduct, 
  removeProduct, 
  singleProduct, 
  updateProduct,
  checkStock,
  updateQuantities
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const productRouter = express.Router();

// Add a new product
productRouter.post(
  '/add',
  adminAuth,
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]),
  addProduct
);

// Remove a product
productRouter.post('/remove', adminAuth, removeProduct);

// Fetch a single product
productRouter.post('/single', singleProduct);

// Fetch all products
productRouter.get('/list', listProducts);

// Update a product
productRouter.post('/update', adminAuth, updateProduct);

// Check stock availability
productRouter.post('/checkStock', authUser, checkStock);

// Update quantities
productRouter.post('/updateQuantities', authUser, updateQuantities);

export default productRouter;