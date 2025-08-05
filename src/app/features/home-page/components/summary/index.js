'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const sectionRef = useRef(null);
  const countRefs = useRef([]);
  const [startCount, setStartCount] = useState(false);

  // Observe if section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCount(true);
          observer.disconnect(); // only trigger once
        }
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  // Start counters when in view
  useEffect(() => {
    if (!startCount) return;

    countRefs.current.forEach((el, index) => {
      if (!el) return;

      let start = 0;
      const end = parseInt(el.dataset.number || '0', 10);
      const increment = Math.ceil(end / 100);
      const duration = 30;

      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          el.innerText = end.toLocaleString();
          clearInterval(counter);
        } else {
          el.innerText = start.toLocaleString();
        }
      }, duration);
    });
  }, [startCount]);

  return (
    <div ref={sectionRef} className="w-full py50 summay-bg">
      <div className="px300">
        <div className="flex flex-wrap  relative z-[9999] gap-2 text-white text-center w-full 3xl:justify-evenly">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-sm flex flex-col flex-wrap justify-center items-center bg-primarycolor py-3 box btn-3 hover-border-3 3xl:w-[230px] xl:w-[200px]"
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
