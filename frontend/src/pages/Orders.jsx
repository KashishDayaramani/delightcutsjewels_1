import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // To store the selected order for the modal

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            item['orderId'] = order._id; // Add order ID for reference
            item['actualPrice'] = item.prices[item.size]; // Fetch the actual price based on the selected size
            allOrdersItem.push(item);
          });
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to show the order report in a modal
  const showOrderReport = (order) => {
    setSelectedOrder(order);
  };

  // Function to close the modal
  const closeOrderReport = () => {
    setSelectedOrder(null);
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  // Function to get the expected delivery date or "Delivered" status
  const getExpectedDelivery = (order) => {
    if (order.status === 'Delivered') {
      return 'Delivered'; // Show "Delivered" if the status is "Delivered"
    } else {
      // Calculate expected delivery date (10 days after order date)
      return new Date(new Date(order.date).getTime() + 10 * 24 * 60 * 60 * 1000).toDateString();
    }
  };

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div>
        {orderData.map((item, index) => (
          <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div className='flex items-start gap-6 text-sm'>
              <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
              <div>
                <p className='sm:text-base font-medium'>{item.name}</p>
                <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                  <p>{currency}{item.actualPrice}</p> {/* Display actual price */}
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className='mt-1'>Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                <p className='mt-1'>Payment: <span className='text-gray-400'>{item.paymentMethod}</span></p>
                <p className='mt-1'>
                  Expected Delivery: <span className='text-gray-400'>{getExpectedDelivery(item)}</span>
                </p>
              </div>
            </div>
            <div className='md:w-1/2 flex justify-between'>
              <div className='flex items-center gap-2'>
                <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                <p className='text-sm md:text-base'>{item.status}</p>
              </div>
              <button onClick={() => showOrderReport(item)} className='border px-4 py-2 text-sm font-medium rounded-sm bg-black text-white hover:bg-gray-800'>
                View Order Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Report Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Order Report</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Item: {selectedOrder.name}</p>
                <p>Quantity: {selectedOrder.quantity}</p>
                <p>Size: {selectedOrder.size}</p>
                <p>Price: {currency}{selectedOrder.actualPrice}</p> {/* Display actual price */}
              </div>
              <div>
                <p className="font-medium">Status: {selectedOrder.status}</p>
                <p>Payment Method: {selectedOrder.paymentMethod}</p>
                <p>
                  Payment:{' '}
                  {selectedOrder.paymentMethod === 'COD' ? (
                    selectedOrder.status === 'Delivered' ? (
                      'Done' // For COD, show "Done" if status is "Delivered"
                    ) : (
                      'Pending' // For COD, show "Pending" if status is not "Delivered"
                    )
                  ) : (
                    selectedOrder.payment ? 'Done' : 'Pending' // For online payments, show "Done" if payment is true, else "Pending"
                  )}
                </p>
              </div>
              <div>
                <p className="font-medium">Order Date: {new Date(selectedOrder.date).toLocaleDateString()}</p>
                <p>Expected Delivery: {getExpectedDelivery(selectedOrder)}</p>
              </div>
            </div>
            <button onClick={closeOrderReport} className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;