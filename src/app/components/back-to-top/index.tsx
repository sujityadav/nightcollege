'use client';

import { useEffect, useState } from 'react';


export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  // Show button when scrollY > 300px
  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // smooth scroll
    });
  };

  return (
    visible && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 bg-primarycolor hover:border border-primarycolor hover:bg-white hover:text-primarycolor text-white xl:w-[40px] 2xl:w-[50px] xl:h-[40px] 2xl:h-[50px] 3xl:w-[40px] 3xl:h-[40px] p-2.5 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300"
        aria-label="Back to Top"
      >
        <i className='pi pi-arrow-up text-md'></i>
      </button>
    )
  );
}
