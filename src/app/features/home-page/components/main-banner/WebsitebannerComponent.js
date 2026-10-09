'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  detectMediaType,
  isVideoMedia,
  normalizeMediaTypeLabel,
} from '@/app/components/common/MediaUpload';

export default function WebsitebannerComponent() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await axios.get('/api/rebranding/home-banners');
        setSlides(response.data?.data || []);
      } catch {
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  const settings = {
    dots: true,
    fade: true,
    infinite: slides.length > 1,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: slides.length > 1,
    autoplaySpeed: 5000,
  };

  if (loading) {
    return (
      <div className="w-full relative custom_silder_banner flex h-[240px] sm:h-[300px] lg:h-[450px] xl:h-[500px] 3xl:h-[28.646vw] items-center justify-center bg-slate-100">
        <span className="text-slate-500 text-sm">Loading…</span>
      </div>
    );
  }

  if (!slides.length) {
    return null;
  }

  const renderMedia = (slide) => {
    const type =
      normalizeMediaTypeLabel(slide.mediaType) ||
      detectMediaType(slide.photo);

    if (isVideoMedia(type)) {
      return (
        <video
          src={slide.photo}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      );
    }

    return (
      <img
        src={slide.photo}
        alt={slide.title || 'Banner'}
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <div className="w-full relative custom_silder_banner">
      <Slider {...settings} className="p-0 m-0">
        {slides.map((slide, index) => (
          <div key={`${slide.photo}-${index}`} className="p-0 m-0">
            <div className="relative h-[240px] sm:h-[300px] lg:h-[450px] xl:h-[500px] 3xl:h-[28.646vw] w-full overflow-hidden">
              {renderMedia(slide)}
              <div className="absolute bottom-0 left-0 z-[2] w-full bg-gradient-to-t from-black to-transparent px-4 py-4 text-white sm:px-6">
                {slide.title ? (
                  <h3 className="text-lg font-bold sm:text-xl">{slide.title}</h3>
                ) : null}
                {slide.description ? (
                  <p className="text-xs sm:text-sm">{slide.description}</p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
