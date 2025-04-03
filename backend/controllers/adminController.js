import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// Helper function to get bestseller for a time period
const getBestsellerForPeriod = async (startDate, endDate) => {
  const orders = await orderModel.find({
    date: { $gte: startDate.getTime(), $lte: endDate.getTime() }
  });

  const productSales = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item._id.toString();
      if (!productSales[productId]) {
        productSales[productId] = {
          quantity: 0,
          revenue: 0,
          productId: productId
        };
      }
      productSales[productId].quantity += item.quantity || 0;
      productSales[productId].revenue += (item.price || 0) * (item.quantity || 0);
    });
  });

  const sortedProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity);
  return sortedProducts.length > 0 ? sortedProducts[0] : null;
};

const getDashboardData = async (req, res) => {
  try {
    // Get current date and calculate start/end of month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get ALL orders
    const allOrders = await orderModel.find({});
    
    // Calculate TOTAL sales
    const totalSales = allOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

    // Monthly sales
    const monthlyOrders = allOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= startOfMonth && orderDate <= endOfMonth;
    });
    const monthlySales = monthlyOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

    // Count ALL customers (excluding admins)
    const totalCustomers = await userModel.countDocuments({ isAdmin: { $ne: true } });
    
    // New customers this month
    const newCustomers = await userModel.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isAdmin: { $ne: true }
    });

    // Count ALL products
    const totalProducts = await productModel.countDocuments();
    
    // Count ALL orders
    const totalOrders = allOrders.length;
    
    // Sales data for last 6 months
    const salesData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const monthOrders = allOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const monthSales = monthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
      
      salesData.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        year: monthStart.getFullYear().toString().slice(-2),
        sales: monthSales,
        orderCount: monthOrders.length
      });
    }
    
    // Get recent 50 orders with populated user data
    const recentOrders = await orderModel.find()
      .sort({ date: -1 })
      .limit(50)
      .populate('userId', 'firstName lastName email');

    // Get all products for dropdown
    const allProducts = await productModel.find({}, 'name category _id image');
    
    // Get bestsellers for each month
    const monthlyBestsellers = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const bestseller = await getBestsellerForPeriod(monthStart, monthEnd);
      monthlyBestsellers.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        year: monthStart.getFullYear().toString().slice(-2),
        bestseller
      });
    }

    // Get current month's bestseller
    const currentBestseller = await getBestsellerForPeriod(startOfMonth, endOfMonth);

    res.json({
      success: true,
      data: {
        totalSales,
        monthlySales,
        totalCustomers,
        newCustomers,
        totalProducts,
        totalOrders,
        salesData,
        recentOrders,
        allProducts,
        monthlyBestsellers,
        currentBestseller
      }
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

const getProductSales = async (req, res) => {
  try {
    const { productId } = req.body;
    const now = new Date();

    // Get all orders containing this product
    const ordersWithProduct = await orderModel.find({
      'items._id': productId
    });

    // Sales data for last 6 months
    const salesData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      // Filter orders for this month
      const monthOrders = ordersWithProduct.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      // Calculate sales and quantity for this product
      let monthSales = 0;
      let monthQuantity = 0;
      
      monthOrders.forEach(order => {
        order.items.forEach(item => {
          if (item._id.toString() === productId) {
            monthSales += (item.price || 0) * (item.quantity || 0);
            monthQuantity += (item.quantity || 0);
          }
        });
      });
      
      salesData.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        year: monthStart.getFullYear().toString().slice(-2),
        sales: monthSales,
        quantity: monthQuantity
      });
    }
    
    res.json({
      success: true,
      salesData
    });
    
  } catch (error) {
    console.error('Product sales error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching product sales',
      error: error.message
    });
  }
};

export { getDashboardData, getProductSales };