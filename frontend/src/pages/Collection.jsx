import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products, search, showSearch, token } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const priceRanges = [
    { label: '₹3,000 - ₹14,999', min: 3000, max: 14999 },
    { label: '₹15,000 - ₹30,000', min: 15000, max: 30000 },
    { label: '₹30,001 - ₹50,000', min: 30001, max: 50000 },
    { label: '₹50,001 - ₹1,00,000', min: 50001, max: 100000 },
    { label: '₹1,00,000+', min: 100001, max: Infinity },
  ];

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory));
    }

    if (maxPrice < 100000) {
      productsCopy = productsCopy.filter((item) => {
        const price = getPrice(item);
        return price <= maxPrice;
      });
    }

    if (selectedPriceRanges.length > 0) {
      productsCopy = productsCopy.filter((item) => {
        const price = getPrice(item);
        return selectedPriceRanges.some((range) => price >= range.min && price <= range.max);
      });
    }

    setFilterProducts(productsCopy);
  };

  const getPrice = (item) => {
    if (item.prices && item.sizes && item.sizes.length > 0) {
      const smallestSize = item.sizes.reduce((a, b) => (a < b ? a : b));
      return item.prices[smallestSize] || item.price;
    }
    return item.price;
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => getPrice(a) - getPrice(b)));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => getPrice(b) - getPrice(a)));
        break;

      default:
        applyFilter();
        break;
    }
  };

  const handleProductClick = (e) => {
    if (!token) {
      e.preventDefault();
      setShowLoginPopup(true);
      return false;
    }
    return true;
  };

  const closeLoginPopup = () => {
    setShowLoginPopup(false);
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products, maxPrice, selectedPriceRanges]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filter Options */}
      <div className='min-w-60'>
        <p
          onClick={() => setShowFilter(!showFilter)}
          className='my-2 text-xl flex items-center cursor-pointer gap-2'
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt=''
          />
        </p>
        {/* Category Filter */}
        <div className={`border border-gray-300 p-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Gold'} onChange={toggleCategory} /> Gold
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Silver'} onChange={toggleCategory} /> Silver
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Diamond'} onChange={toggleCategory} /> Diamond
            </p>
          </div>
        </div>
        {/* SubCategory Filter */}
        <div className={`border border-gray-300 p-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Necklace'} onChange={toggleSubCategory} /> Necklace
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Rings'} onChange={toggleSubCategory} /> Rings
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Earrings'} onChange={toggleSubCategory} /> Earrings
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Coin'} onChange={toggleSubCategory} /> Coin
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Bangles'} onChange={toggleSubCategory} /> Bracelets
            </p>
          </div>
        </div>
        {/* Price Range Filter */}
        <div className={`border border-gray-300 p-5 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>PRICE RANGE</p>
          {/* Custom Range Slider */}
          <div className='mb-6'>
            <input
              type='range'
              min={0}
              max={100000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className='w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:bg-gray-300 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-6px]'
            />
            <div className='flex justify-between text-sm text-gray-700 mt-2'>
              <span>₹0</span>
              <span>{maxPrice === 100000 ? '₹1,00,000+' : `₹${maxPrice.toLocaleString()}`}</span>
            </div>
          </div>
          {/* Price Range Checkboxes */}
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {priceRanges.map((range, index) => (
              <label key={index} className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={selectedPriceRanges.some(
                    (r) => r.min === range.min && r.max === range.max
                  )}
                  onChange={() => {
                    if (selectedPriceRanges.some((r) => r.min === range.min && r.max === range.max)) {
                      setSelectedPriceRanges((prev) =>
                        prev.filter((r) => r.min !== range.min || r.max !== range.max)
                      );
                    } else {
                      setSelectedPriceRanges((prev) => [...prev, range]);
                    }
                  }}
                  className='w-4 h-4'
                />
                {range.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {/* Product Sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className='border-2 border-gray-300 text-sm px-2'
          >
            <option value='relavent'>Sort by: Relavent</option>
            <option value='low-high'>Sort by: Low to High</option>
            <option value='high-low'>Sort by: High to Low</option>
          </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {filterProducts.map((item, index) => {
            const price = getPrice(item);
            return (
              <div 
                key={index} 
                onClick={(e) => {
                  if (handleProductClick(e)) {
                    // User is authenticated, proceed with product click
                    // Add your product click logic here
                  }
                }}
              >
                <ProductItem
                  name={item.name}
                  id={item._id}
                  price={price}
                  image={item.image}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
            <h2 className="text-xl font-semibold mb-4">Login Required</h2>
            <p className="mb-4">You need to login to access this feature.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeLoginPopup}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.location.href = '/login';
                }}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;