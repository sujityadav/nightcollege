'use client';

import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


const slides = [
  {
    image: '/images/login_img.jpg',
    title: 'Slide One',
    description: 'This is the first slide description.',
  },
  {
    image: '/images/silder1.jpg',
    title: 'Slide Two',
    description: 'This is the second slide description.',
  },
  {
    image: '/images/slide3.jpg',
    title: 'Slide Three',
    description: 'This is the third slide description.',
  },
];

export default function WebsitebannerComponent() {
  const settings = {
    dots: true,
    fade: true,
    infinite: true,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000000,
    
  };

  return (
    <div className="w-full relative custom_silder_banner">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index}>
            <div className="relative h-[500px] w-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent text-white px-6 py-4">
                <h3 className="text-xl font-bold">{slide.title}</h3>
                <p className="text-sm">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
