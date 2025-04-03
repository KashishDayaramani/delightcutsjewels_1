import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import adminRouter from './routes/adminRoute.js';

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
    auth: {
        user: process.env.EMAIL_USER, // Your email from .env
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

// Order Schema
const orderSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
    phone: String,
    items: Array,
    amount: Number,
});

const Order = mongoose.model('Order', orderSchema);

// API Endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);

// API to Place Order
app.post('/api/order/place', async (req, res) => {
    try {
        const { firstName, lastName, email, street, city, state, zipcode, country, phone, items, amount } = req.body;

        // Save order to MongoDB
        const newOrder = new Order({
            firstName,
            lastName,
            email,
            street,
            city,
            state,
            zipcode,
            country,
            phone,
            items,
            amount,
        });
        await newOrder.save();

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Order Confirmation',
            text: `Dear ${firstName} ${lastName},\n\nThank you for your order!\n\nOrder Details:\nTotal Amount: $${amount}\n\nWe will notify you once your order is shipped.\n\nBest regards,\nYour Store Team`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(200).json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order.' });
    }
});

// Default Route
app.get('/', (req, res) => {
    res.send('API Working');
});

// Start Server
app.listen(port, () => console.log('Server started on PORT : ' + port));