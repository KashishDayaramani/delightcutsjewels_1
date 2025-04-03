import React, { useState } from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';

const Contact = ({ isLoggedIn }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [messageSent, setMessageSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      // Simulate form submission (e.g., API call)
      console.log('Form Data Submitted:', formData);
      setMessageSent(true);
      setFormData({
        name: '',
        email: '',
        message: '',
      });
    } else {
      alert('Please log in to send a message.');
    }
  };

  return (
    <div>
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        <img className="w-full md:max-w-[480px]" src={assets.contact_img} alt="" />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-xl text-gray-600">Our Store</p>
          <p className="text-gray-500">
            54709 Willms Station <br /> Suite 350, Washington, USA
          </p>
          <p className="text-gray-500">
            Tel: (415) 555-0132 <br /> Email: admin@Delightcuts.com
          </p>
          

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-600 font-semibold mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-600 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-600 font-semibold mb-2">
                How can we help?
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                rows="4"
                required
              />
            </div>
            <button
              type="submit"
              className="border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500"
            >
              Submit Message
            </button>
          </form>

          {messageSent && (
            <p className="text-green-600 font-semibold mt-4">Message Sent!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;