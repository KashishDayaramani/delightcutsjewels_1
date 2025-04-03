import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token, showLoginPopup, setShowLoginPopup } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [showAddedToCartPopup, setShowAddedToCartPopup] = useState(false);
  const [showOutOfStockPopup, setShowOutOfStockPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductData = () => {
      const foundProduct = products.find((item) => item._id === productId);
      if (foundProduct) {
        setProductData(foundProduct);
        setImage(foundProduct.image[0]);
        if (foundProduct.sizes && foundProduct.sizes.length > 0) {
          const smallestSize = foundProduct.sizes.reduce((a, b) => (a < b ? a : b));
          setSize(smallestSize);
        }
      }
    };
    fetchProductData();
  }, [productId, products]);

  const handleAddToCart = () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    if (!size) {
      toast.error('Please select a size');
      return;
    }
    // Divide the quantity by 2 for display purposes
    const displayQuantity = Math.floor(productData.quantity / 2);
    if (displayQuantity <= 0) {
      setShowOutOfStockPopup(true);
      return;
    }
    addToCart(productData._id, size);
    setShowAddedToCartPopup(true);
    setTimeout(() => setShowAddedToCartPopup(false), 2000);
  };

  const getPriceForSize = () => {
    if (productData && productData.prices) {
      if (size) {
        return productData.prices[size];
      } else {
        const smallestSize = productData.sizes.reduce((a, b) => (a < b ? a : b));
        return productData.prices[smallestSize];
      }
    }
    return productData?.price || 0;
  };

  const getSmallestSizePrice = (product) => {
    if (product.sizes && product.sizes.length > 0) {
      const smallestSize = product.sizes.reduce((a, b) => (a < b ? a : b));
      return product.prices[smallestSize];
    }
    return product.price || 0;
  };

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {productData.image.map((item, index) => (
                <img 
                  onClick={() => setImage(item)} 
                  src={item} 
                  key={index} 
                  className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' 
                  alt="" 
                />
              ))}
          </div>
          <div className='w-full sm:w-[80%]'>
              <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          
          {/* Low stock warning - divide quantity by 2 for display */}
          {Math.floor(productData.quantity / 2) <= 5 && Math.floor(productData.quantity / 2) > 0 && (
            <div className='mt-3 text-orange-600 font-medium'>
              Hurry! Only {Math.floor(productData.quantity / 2)} left in stock!
            </div>
          )}

          <p className='mt-5 text-3xl font-medium'>
            {currency}{getPriceForSize()}
          </p>

          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2'>
                {productData.sizes.map((item, index) => (
                  <button 
                    onClick={() => setSize(item)} 
                    className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} 
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
          </div>
          <button 
            onClick={handleAddToCart} 
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
          >
            ADD TO CART
          </button>

          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>✅100% Original product.</p>
              <p>💵Cash on delivery is available on this product.</p>
              <p>🔁Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* --------- Display Related Products ---------- */}
      <RelatedProducts 
        category={productData.category} 
        subCategory={productData.subCategory} 
        getSmallestSizePrice={getSmallestSizePrice} 
      />

      {/* --------- Login Popup ---------- */}
      {showLoginPopup && !token && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg w-80 border border-gray-300">
            <p className="text-center text-lg font-semibold">Please log in to add items to your cart.</p>
            <div className="flex justify-center gap-4 mt-4">
              <button 
                onClick={() => navigate('/login')} 
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                Login
              </button>
              <button 
                onClick={() => setShowLoginPopup(false)} 
                className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------- "Added to Cart" Popup ---------- */}
      {showAddedToCartPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg w-80 border border-gray-300">
            <p className="text-center text-lg font-semibold">Product added to cart!</p>
            <div className="flex justify-center mt-4">
              <button 
                onClick={() => setShowAddedToCartPopup(false)} 
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------- Out of Stock Popup ---------- */}
      {showOutOfStockPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg w-80 border border-gray-300">
            <p className="text-center text-lg font-semibold">This product is out of stock</p>
            <p className="text-center mt-2">We'll notify you when it's available again</p>
            <div className="flex justify-center mt-4">
              <button 
                onClick={() => setShowOutOfStockPopup(false)} 
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : <div className='opacity-0'></div>;
};

export default Product;