import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';

// Global variables
const currency = 'inr';
const deliveryCharge = 50;

// Gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function to update product quantities (ONLY USE THIS FOR UPDATES)
const updateProductQuantities = async (items) => {
  for (const item of items) {
    await productModel.findByIdAndUpdate(
      item._id,
      { $inc: { quantity: -item.quantity } },
      { new: true }
    );
  }
};

// Placing orders using COD Method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        // First check stock availability
        for (const item of items) {
            const product = await productModel.findById(item._id);
            if (!product || product.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${product?.name || 'product'}`
                });
            }
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Update quantities - ONLY HERE FOR COD ORDERS
        await updateProductQuantities(items);

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        const { origin } = req.headers;

        // First check stock availability
        for (const item of items) {
            const product = await productModel.findById(item._id);
            if (!product || product.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${product?.name || 'product'}`
                });
            }
        }

        // Calculate the total amount
        let totalAmount = items.reduce((sum, item) => {
            if (!item.price || isNaN(item.price) || !item.quantity || isNaN(item.quantity)) {
                throw new Error(`Invalid price or quantity for item: ${item.name}`);
            }
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);

        // Add delivery charge
        totalAmount += deliveryCharge;

        if (isNaN(totalAmount) || totalAmount <= 0) {
            throw new Error("Invalid amount calculation");
        }

        // Create the order data
        const orderData = {
            userId,
            items,
            address,
            amount: totalAmount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        };

        // Save the order to the database
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // DO NOT UPDATE QUANTITIES HERE - Wait for payment verification

        // Prepare line items for Stripe
        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: `${item.name} (${item.size})`
                },
                unit_amount: Math.round(parseFloat(item.price) * 100)
            },
            quantity: item.quantity
        }));

        // Add delivery charge as a line item
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: Math.round(deliveryCharge * 100)
            },
            quantity: 1
        });

        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Verify Stripe 
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;

    try {
        if (success === "true") {
            const order = await orderModel.findById(orderId);
            if (order) {
                // ONLY UPDATE QUANTITIES HERE FOR STRIPE PAYMENTS
                await updateProductQuantities(order.items);
                await orderModel.findByIdAndUpdate(orderId, { payment: true });
                await userModel.findByIdAndUpdate(userId, { cartData: {} });
            }
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        // First check stock availability
        for (const item of items) {
            const product = await productModel.findById(item._id);
            if (!product || product.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${product?.name || 'product'}`
                });
            }
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // DO NOT UPDATE QUANTITIES HERE - Wait for payment verification

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        };

        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.json({ success: false, message: error });
            }
            res.json({ success: true, order });
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Verify Razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id } = req.body;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        if (orderInfo.status === 'paid') {
            const order = await orderModel.findById(orderInfo.receipt);
            if (order) {
                // ONLY UPDATE QUANTITIES HERE FOR RAZORPAY PAYMENTS
                await updateProductQuantities(order.items);
                await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
                await userModel.findByIdAndUpdate(userId, { cartData: {} });
            }
            res.json({ success: true, message: "Payment Successful" });
        } else {
            res.json({ success: false, message: 'Payment Failed' });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// User Order Data For Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;

        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update order status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: 'Status Updated' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    verifyRazorpay, 
    verifyStripe, 
    placeOrder, 
    placeOrderStripe, 
    placeOrderRazorpay, 
    allOrders, 
    userOrders, 
    updateStatus 
};