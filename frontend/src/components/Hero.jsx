import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { assets } from '../assets/assets';

const Hero = () => {
  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
  };

  // Array of carousel images
  const carouselImages = [
    assets.hero_img1,
    assets.hero_img2,
    assets.hero_img3,
    assets.hero_img4,
      ];

  return (
    <div className="relative w-full">
      {/* Carousel */}
      <Slider {...settings}>
        {carouselImages.map((img, index) => (
          <div key={index}>
            <img
              className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
              src={img}
              alt={`Luxury Jewellery ${index + 1}`}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Hero;
