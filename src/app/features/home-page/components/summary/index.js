'use client';

import React, { useEffect, useRef } from 'react';
import { Roboto_Slab } from 'next/font/google';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const stats = [
  { label: 'Students', number: 10000 },
  { label: 'Faculty', number: 2562 },
  { label: 'Alumni & Growing', number: 25689 },
  { label: 'Students', number: 15620 },
  { label: 'Books', number: 18738 },
];

export default function Summary() {
  const countRefs = useRef([]);

  useEffect(() => {
    countRefs.current.forEach((el, index) => {
      if (!el) return;
      let start = 0;
      const end = parseInt(el.dataset.number || '0', 10);
      const increment = Math.ceil(end / 100); // Adjust speed
      const duration = 30; // milliseconds

      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          el.innerText = end.toLocaleString(); // Format with commas
          clearInterval(counter);
        } else {
          el.innerText = start.toLocaleString();
        }
      }, duration);
    });
  }, []);

  return (
    <div className="w-full py50 summay-bg">
      <div className="px300">
        <div className="flex flex-wrap justify-around relative z-[9999] text-white text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-sm flex flex-col justify-center items-center bg-primarycolor py-3 box btn-3 hover-border-3 w-[230px]"
            >
              <div className={roboto_slab.className}>
                <h3
                  className="font40 font-[700]"
                  data-number={stat.number}
                  ref={(el) => (countRefs.current[index] = el)}
                >
                  0
                </h3>
              </div>
              <div>
                <h3 className="font16 leading-[140%]">{stat.label}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
