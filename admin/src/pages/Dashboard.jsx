import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = ({ token }) => {
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    monthlySales: 0,
    totalCustomers: 0,
    newCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    salesData: [],
    recentOrders: [],
    allProducts: [],
    monthlyBestsellers: [],
    currentBestseller: null
  });
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productSalesData, setProductSalesData] = useState([]);
  const [selectedBestsellerMonth, setSelectedBestsellerMonth] = useState('');

  const fetchDashboardData = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/admin/dashboard', {}, { headers: { token } });
      if (response.data.success) {
        setDashboardData(response.data.data);
        if (response.data.data.allProducts?.length > 0) {
          setSelectedProduct(response.data.data.allProducts[0]._id);
          fetchProductSales(response.data.data.allProducts[0]._id);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductSales = async (productId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/admin/product-sales',
        { productId },
        { headers: { token } }
      );
      if (response.data.success) {
        setProductSalesData(response.data.salesData);
      }
    } catch (error) {
      console.error('Error fetching product sales:', error);
      toast.error('Failed to load product sales data');
    }
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    fetchProductSales(productId);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard data...</div>;
  }

  const renderBestsellerInfo = () => {
    let bestseller;
    if (selectedBestsellerMonth === '') {
      bestseller = dashboardData.currentBestseller;
    } else {
      bestseller = dashboardData.monthlyBestsellers[selectedBestsellerMonth]?.bestseller;
    }

    if (!bestseller) return <p className="text-gray-500">No bestseller data available</p>;

    const product = dashboardData.allProducts?.find(p => p._id === bestseller.productId);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          {product?.image?.[0] && (
            <img 
              src={product.image[0]} 
              alt={product.name}
              className="w-full h-48 object-contain rounded-lg"
            />
          )}
        </div>
        <div className="col-span-2">
          <h4 className="text-xl font-bold">{product?.name || 'Unknown Product'}</h4>
          <p className="text-gray-600 mb-4">{product?.category || ''}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Units Sold</p>
              <p className="text-2xl font-bold">{bestseller.quantity}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Revenue Generated</p>
              <p className="text-2xl font-bold">{currency}{bestseller.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
          <p className="text-2xl font-bold mt-2">{currency}{dashboardData.totalSales.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Monthly Sales</h3>
          <p className="text-2xl font-bold mt-2">{currency}{dashboardData.monthlySales.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
          <p className="text-2xl font-bold mt-2">{dashboardData.totalCustomers}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
          <p className="text-2xl font-bold mt-2">{dashboardData.totalOrders}</p>
        </div>
      </div>

      {/* Bestseller Products Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Monthly Bestseller Products</h3>
        
        <div className="mb-6">
          <label htmlFor="bestseller-month" className="block text-sm font-medium text-gray-700 mb-2">
            Select Month:
          </label>
          <select
            id="bestseller-month"
            value={selectedBestsellerMonth}
            onChange={(e) => setSelectedBestsellerMonth(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Current Month</option>
            {dashboardData.monthlyBestsellers?.map((monthData, index) => (
              <option key={index} value={index}>
                {monthData.month} '{monthData.year}
              </option>
            ))}
          </select>
        </div>

        {renderBestsellerInfo()}
      </div>

      {/* Product Sales Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Product Sales Analysis</h3>
        
        <div className="mb-6">
          <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Product:
          </label>
          <select
            id="product-select"
            value={selectedProduct}
            onChange={handleProductChange}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {dashboardData.allProducts?.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} ({product.category})
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium mb-3">Monthly Sales</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${currency}${value}`, "Sales"]}
                      labelFormatter={(month) => `${month}`}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#4f46e5" name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-3">Sales Details</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                {dashboardData.allProducts?.find(p => p._id === selectedProduct) && (
                  <>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Product Name:</span>
                      <span>{dashboardData.allProducts.find(p => p._id === selectedProduct).name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Category:</span>
                      <span>{dashboardData.allProducts.find(p => p._id === selectedProduct).category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Total Sold:</span>
                      <span>
                        {productSalesData.reduce((sum, month) => sum + (month.quantity || 0), 0)} units
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Total Revenue:</span>
                      <span>
                        {currency}
                        {productSalesData.reduce((sum, month) => sum + (month.sales || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Orders (Last 50)</h3>
        {dashboardData.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.userId?.firstName || order.address?.firstName} {order.userId?.lastName || order.address?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {currency}{order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.payment || order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {order.payment || order.status === 'Delivered' ? 'Done' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                        {order.status || 'Processing'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent orders found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;