import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
    const [currentState, setCurrentState] = useState('Login');
    const { token, setToken, navigate, backendUrl, setUserName } = useContext(ShopContext);

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');

    // Password validation states
    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSymbol, setHasSymbol] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    // Email validation state
    const [isEmailValid, setIsEmailValid] = useState(true);

    // Validate password on change
    useEffect(() => {
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const numberRegex = /[0-9]/;
        const symbolRegex = /[!@#$%^&*]/;

        setHasUppercase(uppercaseRegex.test(password));
        setHasLowercase(lowercaseRegex.test(password));
        setHasNumber(numberRegex.test(password));
        setHasSymbol(symbolRegex.test(password));

        // Check if all criteria are met
        setIsPasswordValid(hasUppercase && hasLowercase && hasNumber && hasSymbol);
    }, [password, hasUppercase, hasLowercase, hasNumber, hasSymbol]);

    // Validate email on change
    useEffect(() => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo)\.com$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.ac\.[a-zA-Z]{2,3}$/;
        setIsEmailValid(emailRegex.test(email));
    }, [email]);

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (currentState === 'Sign Up') {
            if (password !== confirmPassword) {
                return toast.error('Passwords do not match!');
            }

            if (!isPasswordValid) {
                return toast.error('Password must contain an uppercase letter, a lowercase letter, a number, and a symbol.');
            }

            if (!isEmailValid) {
                return toast.error('Please use a valid email address');
            }
        }

        try {
            if (currentState === 'Sign Up') {
                const response = await axios.post(backendUrl + '/api/user/register', { name, email, password });
                if (response.data.success) {
                    toast.success('Account created successfully! Please log in.');
                    setCurrentState('Login');
                } else {
                    toast.error(response.data.message);
                }
            } else {
                const response = await axios.post(backendUrl + '/api/user/login', { email, password });
                if (response.data.success) {
                    setToken(response.data.token);
                    setUserName(name);
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('userName', name);
                    navigate('/');
                } else {
                    toast.error(response.data.message);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [token]);

    return (
        <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
            <div className="inline-flex items-center gap-2 mb-2 mt-10">
                <p className="prata-regular text-3xl">{currentState}</p>
                <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
            </div>

            {currentState === 'Sign Up' && (
                <input onChange={(e) => setName(e.target.value)} value={name} type="text" className="w-full px-3 py-2 border border-gray-800" placeholder="Name" required />
            )}

            {/* Email Input */}
            <div className="w-full">
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    className={`w-full px-3 py-2 border ${email && !isEmailValid ? 'border-red-500' : 'border-gray-800'}`}
                    placeholder="Email"
                    required
                />
                {email && !isEmailValid && (
                    <p className="text-red-500 text-sm mt-1">Please use a valid email address </p>
                )}
            </div>

            {/* Password Input */}
            <div className="w-full">
                <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    className={`w-full px-3 py-2 border ${currentState === 'Sign Up' && password && !isPasswordValid ? 'border-red-500' : 'border-gray-800'}`}
                    placeholder="Password"
                    required
                />
            </div>

            {/* Confirm Password Input - Only for Sign Up */}
            {currentState === 'Sign Up' && (
                <div className="w-full">
                    <input
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        type="password"
                        className={`w-full px-3 py-2 border ${confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-800'}`}
                        placeholder="Confirm Password"
                        required
                    />
                    {confirmPassword && password !== confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">Passwords do not match.</p>
                    )}
                </div>
            )}

            {/* Password Validation Feedback */}
            {currentState === 'Sign Up' && (
                <div className="w-full text-sm text-gray-700 mt-2">
                    <p className="font-medium">Password must contain:</p>
                    <div className="flex flex-col gap-1 mt-1">
                        <div className={`flex items-center gap-2 ${hasUppercase ? 'text-green-500' : 'text-red-500'}`}>
                            {hasUppercase ? '✓' : '✗'} At least one uppercase letter
                        </div>
                        <div className={`flex items-center gap-2 ${hasLowercase ? 'text-green-500' : 'text-red-500'}`}>
                            {hasLowercase ? '✓' : '✗'} At least one lowercase letter
                        </div>
                        <div className={`flex items-center gap-2 ${hasNumber ? 'text-green-500' : 'text-red-500'}`}>
                            {hasNumber ? '✓' : '✗'} At least one number
                        </div>
                        <div className={`flex items-center gap-2 ${hasSymbol ? 'text-green-500' : 'text-red-500'}`}>
                            {hasSymbol ? '✓' : '✗'} At least one symbol
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle between Login and Sign Up */}
            <div className="w-full flex justify-end text-sm mt-[-8px]">
                {currentState === 'Login' ? (
                    <p onClick={() => setCurrentState('Sign Up')} className="cursor-pointer">Create account</p>
                ) : (
                    <p onClick={() => setCurrentState('Login')} className="cursor-pointer">Login Here</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                className={`bg-black text-white font-light px-8 py-2 mt-4 ${currentState === 'Sign Up' && (!isPasswordValid || !isEmailValid) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentState === 'Sign Up' && (!isPasswordValid || !isEmailValid)}
            >
                {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
            </button>
        </form>
    );
};

export default Login;