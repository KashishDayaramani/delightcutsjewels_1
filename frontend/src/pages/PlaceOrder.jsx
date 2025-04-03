import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import ReactCountryFlag from 'react-country-flag';

const PlaceOrder = () => {
    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const countryOptions = countryList().getData().map(country => ({
        value: country.value,
        label: country.label,
        flag: country.value
    }));

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            padding: '0 0.75rem',
            borderColor: errors.country ? '#ef4444' : (state.isFocused ? '#000' : '#d1d5db'),
            borderRadius: '0.375rem',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(0,0,0,0.2)' : 'none',
            height: '40px',
            minHeight: '40px',
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexWrap: 'nowrap',
        }),
        singleValue: (provided) => ({
            ...provided,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100% - 40px)',
        }),
        placeholder: (provided) => ({
            ...provided,
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '40px',
            display: 'flex',
            alignItems: 'center',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 10,
            width: '100%',
        }),
    };

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({ ...data, [name]: value }));
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    const handleNumberInput = (event) => {
        const value = event.target.value;
        if (!/^\d*$/.test(value)) {
            event.target.value = value.replace(/\D/g, '');
        }
        onChangeHandler(event);
    };

    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo)\.com$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.ac\.[a-zA-Z]{2,3}$/;
        return regex.test(email);
    };

    const validatePhone = (phone) => {
        const regex = /^\d{10}$/;
        return regex.test(phone);
    };

    const validateName = (name) => {
        const regex = /^[a-zA-Z]{3,}$/;
        return regex.test(name);
    };

    const validateZipcode = (zipcode) => {
        const regex = /^\d{6}$/;
        return regex.test(zipcode);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!validateName(formData.firstName)) {
            newErrors.firstName = 'First name must be at least 3 letters long and contain no numbers.';
        }

        if (!validateName(formData.lastName)) {
            newErrors.lastName = 'Last name must be at least 3 letters long and contain no numbers.';
        }

        if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number.';
        }

        if (!validateZipcode(formData.zipcode)) {
            newErrors.zipcode = 'Please enter a valid 6-digit ZIP code.';
        }

        if (!selectedCountry) {
            newErrors.country = 'Please select a country.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const checkStockAvailability = async () => {
        try {
            const response = await axios.post(
                backendUrl + '/api/product/checkStock',
                { cartItems },
                { headers: { token } }
            );
            return response.data.success;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setIsProcessing(true);

        if (!validateForm()) {
            setIsProcessing(false);
            return;
        }

        try {
            // First check stock availability
            const isStockAvailable = await checkStockAvailability();
            if (!isStockAvailable) {
                toast.error('Some items in your cart are out of stock or quantity is insufficient');
                setIsProcessing(false);
                return;
            }

            let orderItems = [];

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items));
                        if (itemInfo) {
                            itemInfo.size = item;
                            itemInfo.quantity = cartItems[items][item];
                            itemInfo.price = itemInfo.prices[item];
                            orderItems.push(itemInfo);
                        }
                    }
                }
            }

            let orderData = {
                address: { ...formData, country: selectedCountry.label },
                items: orderItems,
                amount: getCartAmount() + delivery_fee
            };

            switch (method) {
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
                    if (response.data.success) {
                        // Update quantities after successful order
                        await axios.post(
                            backendUrl + '/api/product/updateQuantities',
                            { items: orderItems },
                            { headers: { token } }
                        );
                        setCartItems({});
                        navigate('/orders');
                    } else {
                        toast.error(response.data.message);
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } });
                    if (responseStripe.data.success) {
                        // Update quantities before redirecting to payment
                        await axios.post(
                            backendUrl + '/api/product/updateQuantities',
                            { items: orderItems },
                            { headers: { token } }
                        );
                        const { session_url } = responseStripe.data;
                        window.location.replace(session_url);
                    } else {
                        toast.error(responseStripe.data.message);
                    }
                    break;

                case 'razorpay':
                    const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, { headers: { token } });
                    if (responseRazorpay.data.success) {
                        // Update quantities before payment
                        await axios.post(
                            backendUrl + '/api/product/updateQuantities',
                            { items: orderItems },
                            { headers: { token } }
                        );
                        initPay(responseRazorpay.data.order);
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Order Payment',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay', response, { headers: { token } });
                    if (data.success) {
                        navigate('/orders');
                        setCartItems({});
                    }
                } catch (error) {
                    console.log(error);
                    toast.error(error);
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className='flex gap-3'>
                    <div className='w-full'>
                        <input
                            required
                            onChange={onChangeHandler}
                            name='firstName'
                            value={formData.firstName}
                            className={`border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded py-1.5 px-3.5 w-full`}
                            type="text"
                            placeholder='First name'
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div className='w-full'>
                        <input
                            required
                            onChange={onChangeHandler}
                            name='lastName'
                            value={formData.lastName}
                            className={`border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded py-1.5 px-3.5 w-full`}
                            type="text"
                            placeholder='Last name'
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                </div>
                <div>
                    <input
                        required
                        onChange={onChangeHandler}
                        name='email'
                        value={formData.email}
                        className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded py-1.5 px-3.5 w-full`}
                        type="email"
                        placeholder='Email address'
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <input
                    required
                    onChange={onChangeHandler}
                    name='street'
                    value={formData.street}
                    className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                    type="text"
                    placeholder='Street'
                />
                <div className='flex gap-3'>
                    <input
                        required
                        onChange={onChangeHandler}
                        name='city'
                        value={formData.city}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        type="text"
                        placeholder='City'
                    />
                    <input
                        onChange={onChangeHandler}
                        name='state'
                        value={formData.state}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        type="text"
                        placeholder='State'
                    />
                </div>
                <div className='flex gap-3'>
                    <div className='w-full'>
                        <input
                            required
                            onChange={handleNumberInput}
                            name='zipcode'
                            value={formData.zipcode}
                            className={`border ${errors.zipcode ? 'border-red-500' : 'border-gray-300'} rounded py-1.5 px-3.5 w-full`}
                            type="text"
                            placeholder='ZIP Code'
                            maxLength={6}
                        />
                        {errors.zipcode && <p className="text-red-500 text-sm mt-1">{errors.zipcode}</p>}
                    </div>
                    <div className='w-full'>
                        <Select
                            options={countryOptions}
                            value={selectedCountry}
                            onChange={(option) => setSelectedCountry(option)}
                            placeholder="Select Country"
                            styles={customStyles}
                            formatOptionLabel={(option) => (
                                <div className="flex items-center gap-2">
                                    <ReactCountryFlag
                                        countryCode={option.value}
                                        svg
                                        style={{
                                            width: '1.5em',
                                            height: '1.5em',
                                        }}
                                        title={option.value}
                                    />
                                    <span>{option.label}</span>
                                </div>
                            )}
                            components={{
                                SingleValue: ({ data }) => (
                                    <div className="flex items-center gap-2">
                                        <ReactCountryFlag
                                            countryCode={data.value}
                                            svg
                                            style={{
                                                width: '1.5em',
                                                height: '1.5em',
                                            }}
                                            title={data.value}
                                        />
                                        <span>{data.label}</span>
                                    </div>
                                )
                            }}
                        />
                        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                    </div>
                </div>
                <div>
                    <input
                        required
                        onChange={handleNumberInput}
                        name='phone'
                        value={formData.phone}
                        className={`border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded py-1.5 px-3.5 w-full`}
                        type="text"
                        placeholder='Phone'
                        maxLength={10}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button 
                            type='submit' 
                            className='bg-black text-white px-16 py-3 text-sm'
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'PROCESSING...' : 'PLACE ORDER'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;