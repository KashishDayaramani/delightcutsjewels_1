import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Create the context
export const ShopContext = createContext();

// Create the provider component
const ShopContextProvider = ({ children }) => {
    const currency = '₹';
    const delivery_fee = 50;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

    const navigate = useNavigate();

    const addToCart = async (itemId, size) => {
        if (!token) {
            setShowLoginPopup(true);
            return;
        }

        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        setCartItems(cartData);

        try {
            await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } });
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    totalCount += cartItems[items][item];
                }
            }
        }
        return totalCount;
    };

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);

        try {
            await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } });
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    const size = item;
                    const price = itemInfo.prices && itemInfo.prices[size] ? itemInfo.prices[size] : itemInfo.price || 0;
                    totalAmount += price * cartItems[items][item];
                }
            }
        }
        return totalAmount;
    };

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list');
            if (response.data.success) {
                setProducts(response.data.products.reverse());
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getUserCart = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } });
            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        getProductsData();
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            getUserCart(token);
        }
    }, [token]);

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token, showLoginPopup, setShowLoginPopup,
        userName, setUserName
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
