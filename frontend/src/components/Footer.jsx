import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <div className="bg-gray-50 py-12 mt-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="mb-8 sm:mb-0">
            <img src={assets.logo} className="mb-5 w-32" alt="Delightcuts Logo" />
            <p className="text-gray-600 text-sm leading-relaxed">
            Discover exquisite jewelry at DelightCuts, where timeless beauty meets modern elegance. From dazzling rings to statement necklaces, our handcrafted collections are designed to celebrate your unique style. With a commitment to quality, authenticity, and customer satisfaction, we bring you the finest jewelry pieces to cherish forever.
            </p>
          </div>

          {/* COMPANY Links */}
          <div className="mb-8 sm:mb-0">
            <h3 className="text-xl font-semibold mb-5 text-gray-800">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-600 hover:text-gray-900 transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* GET IN TOUCH */}
          <div className="mb-8 sm:mb-0">
            <h3 className="text-xl font-semibold mb-5 text-gray-800">GET IN TOUCH</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="tel:+1-212-456-7890"
                  className="text-blue-500 hover:underline transition-colors"
                >
                  +1-212-456-7890
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@Delightcuts.com"
                  className="text-blue-500 hover:underline transition-colors"
                >
                  contact@Delightcuts.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-10 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-600">
            Copyright &copy; 2025 Delightcuts.com - All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;