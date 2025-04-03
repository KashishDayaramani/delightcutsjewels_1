import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  prices: { type: Object, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: [{ type: String }],
  image: [{ type: String }],
  quantity: { 
    type: Number, 
    required: true, 
    default: 0,
    min: 0
  },
  date: { type: Date, default: Date.now },
});

export default mongoose.model('Product', productSchema);