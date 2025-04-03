import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Privacy Policy
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <p className="mb-6 text-gray-600 leading-relaxed">
          At Delightcuts, we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your personal information when you visit our website or make a purchase from us.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-700">
          1. Information We Collect
        </h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
          We may collect the following types of information:
        </p>
        <ul className="list-disc pl-8 mb-6 text-gray-600 leading-relaxed">
          <li>Personal Information: Name, email address, phone number, shipping address, and payment details.</li>
          <li>Technical Information: IP address, browser type, operating system, and browsing behavior.</li>
          <li>Cookies: We use cookies to enhance your experience on our website.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-700">
          2. How We Use Your Information
        </h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
          We use your information for the following purposes:
        </p>
        <ul className="list-disc pl-8 mb-6 text-gray-600 leading-relaxed">
          <li>To process and fulfill your orders.</li>
          <li>To communicate with you about your orders and provide customer support.</li>
          <li>To improve our website and services.</li>
          <li>To send you promotional offers and updates (if you have opted in).</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-700">
          3. Data Security
        </h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
          We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-700">
          4. Your Rights
        </h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
          You have the right to:
        </p>
        <ul className="list-disc pl-8 mb-6 text-gray-600 leading-relaxed">
          <li>Access, update, or delete your personal information.</li>
          <li>Opt-out of receiving promotional communications.</li>
          <li>Request a copy of the data we hold about you.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-700">
          5. Changes to This Policy
        </h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we encourage you to review it periodically.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-700">
          6. Contact Us
        </h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a
            href="mailto:contact@Delightcuts.com"
            className="text-blue-500 hover:underline"
          >
            contact@Delightcuts.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;