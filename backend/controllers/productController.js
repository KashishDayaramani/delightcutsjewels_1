import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Function to add a product
const addProduct = async (req, res) => {
  try {
    const { name, description, prices, category, subCategory, sizes, quantity } = req.body;

    // Upload images to Cloudinary
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url;
      })
    );

    // Parse prices and sizes
    const parsedPrices = JSON.parse(prices);
    const parsedSizes = JSON.parse(sizes);

    // Create product data
    const productData = {
      name,
      description,
      category,
      prices: parsedPrices,
      subCategory,
      sizes: parsedSizes,
      image: imagesUrl,
      quantity: quantity || 0,
      date: Date.now(),
    };

    // Save the product to the database
    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function to list all products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function to remove a product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function to fetch a single product
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function to update a product
const updateProduct = async (req, res) => {
  try {
    const { id, name, description, prices, category, subCategory, sizes, quantity } = req.body;

    // Find the product by ID
    const product = await productModel.findById(id);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Update the product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.prices = prices || product.prices;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.sizes = sizes || product.sizes;
    product.quantity = quantity !== undefined ? quantity : product.quantity;

    // Save the updated product
    await product.save();

    res.json({ success: true, message: "Product updated successfully", product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Check stock availability
const checkStock = async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        const quantity = cartItems[productId][size];
        const product = await productModel.findById(productId);
        
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${productId} not found`
          });
        }
        
        if (product.quantity < quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ${product.name} (size: ${size}). Only ${product.quantity} available.`
          });
        }
      }
    }
    
    res.json({ success: true, message: 'Stock available' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quantities after order - FIXED VERSION
const updateQuantities = async (req, res) => {
  try {
    const { items } = req.body;

    // Validate input
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format. Expected array of items.'
      });
    }

    // Verify all products exist and have sufficient stock
    for (const item of items) {
      if (!item._id || item.quantity === undefined || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must contain _id and positive quantity'
        });
      }

      const product = await productModel.findById(item._id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item._id} not found`
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
        });
      }
    }

    // Process all updates in a single operation
    const updateOperations = items.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.quantity } }
      }
    }));

    await productModel.bulkWrite(updateOperations);

    res.json({
      success: true,
      message: 'Product quantities updated successfully'
    });

  } catch (error) {
    console.error('Error updating quantities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product quantities',
      error: error.message
    });
  }
};

export { 
  listProducts, 
  addProduct, 
  removeProduct, 
  singleProduct, 
  updateProduct,
  checkStock,
  updateQuantities
};