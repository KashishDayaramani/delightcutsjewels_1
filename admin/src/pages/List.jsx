import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, productId: null });

  // Fetch all products
  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Remove a product
  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setConfirmationModal({ isOpen: false, productId: null });
    }
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter products based on search query
  const filteredList = list.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item._id.includes(searchQuery)
    );
  });

  // Handle edit button click
  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  // Handle update form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Multiply the quantity by 2 before sending to server
      const updatedQuantity = editingProduct.quantity * 2;
      
      const response = await axios.post(
        backendUrl + '/api/product/update',
        {
          id: editingProduct._id,
          name: editingProduct.name,
          description: editingProduct.description,
          prices: editingProduct.prices,
          category: editingProduct.category,
          subCategory: editingProduct.subCategory,
          sizes: editingProduct.sizes,
          quantity: updatedQuantity
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setEditingProduct(null);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Get the smallest size price for a product
  const getSmallestSizePrice = (product) => {
    if (product.sizes && product.sizes.length > 0 && product.prices) {
      const smallestSize = product.sizes.reduce((a, b) => (a < b ? a : b));
      return product.prices[smallestSize] || product.price || 0;
    }
    return product.price || 0;
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='p-6'>
      <p className='mb-2 text-xl font-bold'>All Products List</p>
      <div className='mb-4'>
        <input
          type='text'
          placeholder='Search by name, category, or ID'
          value={searchQuery}
          onChange={handleSearch}
          className='w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
        />
      </div>
      <div className='flex flex-col gap-2'>
        {/* ------- List Table Title ---------- */}
        <div className='hidden md:grid grid-cols-[80px_2fr_1fr_1fr_1fr_2fr_120px] items-center py-3 px-4 border border-gray-300 bg-gray-100 text-sm rounded-lg'>
          <b className='text-center'>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b className='text-right'>Price</b>
          <b className='text-center'>Stock</b>
          <b>ID</b>
          <b className='text-center'>Action</b>
        </div>

        {/* ------ Product List ------ */}
        {filteredList.map((item, index) => (
          <div
            className='grid grid-cols-[80px_2fr_1fr_1fr_1fr_2fr_120px] items-center gap-4 py-3 px-4 border border-gray-300 bg-white text-sm rounded-lg'
            key={index}
          >
            <div className='flex justify-center'>
              <img className='w-12 h-12 object-cover rounded-lg' src={item.image[0]} alt="" />
            </div>
            <p className='truncate'>{item.name}</p>
            <p className='truncate'>{item.category}</p>
            <p className='text-right'>{currency}{getSmallestSizePrice(item)}</p>
            <p className={`text-center ${item.quantity <= 10 ? 'text-orange-600 font-medium' : ''}`}>
              {item.quantity} {item.quantity <= 10 && '(Low Stock)'}
            </p>
            <p className='text-gray-600 truncate'>{item._id}</p>
            <div className='flex justify-center gap-2'>
              <button
                onClick={() => handleEdit(item)}
                className='px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmationModal({ isOpen: true, productId: item._id })}
                className='px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded-lg w-full max-w-[500px] border border-gray-300'>
            <h2 className='text-xl mb-4 font-bold'>Edit Product</h2>
            <form onSubmit={handleUpdate}>
              <div className='mb-4'>
                <label className='block mb-2 text-gray-700'>Name</label>
                <input
                  type='text'
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2 text-gray-700'>Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-2 text-gray-700'>Current Stock Quantity</label>
                <input
                  type='number'
                  min="0"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                />
                                {editingProduct.quantity <= 10 && (
                  <p className='text-orange-600 text-sm mt-1'>Low stock warning (≤10 items)</p>
                )}
              </div>
              <div className='mb-4'>
                <label className='block mb-2 text-gray-700'>Prices</label>
                {editingProduct.sizes.map((size) => (
                  <div key={size} className='flex items-center gap-3 mb-2'>
                    <p className='text-gray-700'>{size}</p>
                    <input
                      type='number'
                      value={editingProduct.prices[size] || ''}
                      onChange={(e) => {
                        const newPrices = { ...editingProduct.prices, [size]: e.target.value };
                        setEditingProduct({ ...editingProduct, prices: newPrices });
                      }}
                      className='px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                    />
                  </div>
                ))}
              </div>
              <div className='flex justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => setEditingProduct(null)}
                  className='px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded-lg w-full max-w-[400px] border border-gray-300'>
            <h2 className='text-xl mb-4 font-bold'>Confirm Deletion</h2>
            <p className='mb-6'>Are you sure you want to delete this product?</p>
            <div className='flex justify-end gap-2'>
              <button
                onClick={() => setConfirmationModal({ isOpen: false, productId: null })}
                className='px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() => removeProduct(confirmationModal.productId)}
                className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;