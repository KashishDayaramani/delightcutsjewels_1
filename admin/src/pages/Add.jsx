import React, { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prices, setPrices] = useState({}); // Object to store prices for each size
  const [category, setCategory] = useState('Gold');
  const [subCategory, setSubCategory] = useState('Necklace');
  const [sizes, setSizes] = useState([]);
  const [quantity, setQuantity] = useState(0); // Added quantity state

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append('name', name);
      formData.append('description', description);
      formData.append('prices', JSON.stringify(prices));
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('quantity', quantity); // Added quantity to form data

      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);

      const response = await axios.post(backendUrl + '/api/product/add', formData, { headers: { token } });

      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setPrices({});
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setSizes([]);
        setQuantity(0);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handlePriceChange = (size, value) => {
    setPrices((prev) => ({
      ...prev,
      [size]: value,
    }));
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <p className='mb-2'>Upload Image</p>
        <div className='flex gap-2'>
          <label htmlFor='image1'>
            <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt='' />
            <input onChange={(e) => setImage1(e.target.files[0])} type='file' id='image1' hidden />
          </label>
          <label htmlFor='image2'>
            <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt='' />
            <input onChange={(e) => setImage2(e.target.files[0])} type='file' id='image2' hidden />
          </label>
          <label htmlFor='image3'>
            <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt='' />
            <input onChange={(e) => setImage3(e.target.files[0])} type='file' id='image3' hidden />
          </label>
          <label htmlFor='image4'>
            <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt='' />
            <input onChange={(e) => setImage4(e.target.files[0])} type='file' id='image4' hidden />
          </label>
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type='text' placeholder='Type here' required />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type='text' placeholder='Write content here' required />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product category</p>
          <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value='Gold'>Gold</option>
            <option value='Silver'>Silver</option>
            <option value='Diamond'>Diamond</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Sub category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value='Necklace'>Necklace</option>
            <option value='Rings'>Rings</option>
            <option value='Earrings'>Earrings</option>
            <option value='Coin'>Coin</option>
            <option value='Bangles'>Bracelets</option>
          </select>
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Initial Stock Quantity</p>
        <input 
          onChange={(e) => setQuantity(e.target.value)} 
          value={quantity} 
          className='w-full max-w-[500px] px-3 py-2' 
          type='number' 
          min="0"
          placeholder='Enter initial stock quantity' 
          required 
        />
      </div>

      <div>
        <p className='mb-2'>Product Sizes and Prices</p>
        <div className='flex flex-col gap-3'>
          {['48', '52', '56', '60', '64'].map((size) => (
            <div key={size} className='flex items-center gap-3'>
              <div
                onClick={() =>
                  setSizes((prev) =>
                    prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
                  )
                }
              >
                <p
                  className={`${
                    sizes.includes(size) ? 'bg-pink-100' : 'bg-slate-200'
                  } px-3 py-1 cursor-pointer`}
                >
                  {size}
                </p>
              </div>
              {sizes.includes(size) && (
                <input
                  type='number'
                  placeholder='Price'
                  value={prices[size] || ''}
                  onChange={(e) => handlePriceChange(size, e.target.value)}
                  className='px-3 py-1 border border-gray-300'
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <button type='submit' className='w-28 py-3 mt-4 bg-black text-white'>
        ADD
      </button>
    </form>
  );
};

export default Add;