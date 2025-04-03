import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  // Function to get the smallest size price for a product
  const getSmallestSizePrice = (product) => {
    // Check if the product has sizes and prices
    if (product.sizes && product.sizes.length > 0 && product.prices) {
      // Find the smallest size
      const smallestSize = product.sizes.reduce((a, b) => (a < b ? a : b));
      // Return the price for the smallest size
      return product.prices[smallestSize];
    }
    // If no sizes are available, return the default price
    return product.price || 0;
  };

  useEffect(() => {
    if (products.length > 0) {
      let productsCopy = products.slice();

      // Filter products by category and subCategory
      productsCopy = productsCopy.filter((item) => category === item.category);
      productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);

      // Limit to 5 related products
      setRelated(productsCopy.slice(0, 5));
    }
  }, [products, category, subCategory]);

  // Debugging: Log the related products and their smallest size prices
  useEffect(() => {
    console.log('Related Products:', related);
    related.forEach((item) => {
      console.log(`Product: ${item.name}, Smallest Price: ${getSmallestSizePrice(item)}`);
    });
  }, [related]);

  return (
    <div className='my-24'>
      <div className='text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={"PRODUCTS"} />
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            price={getSmallestSizePrice(item)} // Use the smallest size price
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;