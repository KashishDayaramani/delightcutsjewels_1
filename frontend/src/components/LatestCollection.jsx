import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products]);

  // Function to get the price for the smallest size
  const getPrice = (item) => {
    if (item.prices && item.sizes && item.sizes.length > 0) {
      const smallestSize = item.sizes.reduce((a, b) => (a < b ? a : b));
      return item.prices[smallestSize] || item.price; // Fallback to default price if size-specific pricing is not available
    }
    return item.price; // Fallback to default price if sizes or prices are not defined
  };

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'COLLECTIONS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
        Discover our Latest Collection – Timeless Elegance, Modern Charm!
        </p>
      </div>

      {/* Rendering Products */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {latestProducts.map((item, index) => {
          const price = getPrice(item); // Get the price for the smallest size or default price
          return (
            <ProductItem
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              price={price} // Pass the calculated price
            />
          );
        })}
      </div>
    </div>
  );
};

export default LatestCollection;