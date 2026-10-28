'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Roboto_Slab } from 'next/font/google';
import axios from 'axios';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

function parseCountNumber(value) {
  const digits = String(value ?? '').replace(/[^\d]/g, '');
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function Summary() {
  const sectionRef = useRef(null);
  const countRefs = useRef([]);
  const [startCount, setStartCount] = useState(false);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await axios.get('/api/college-statistics/public');
        if (response.data?.success) {
          setStats(response.data.data || []);
        }
      } catch {
        setStats([]);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCount(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [stats.length]);

  useEffect(() => {
    if (!startCount || !stats.length) return;

    countRefs.current.forEach((el, index) => {
      if (!el) return;

      const stat = stats[index];
      const end = parseCountNumber(stat?.count);
      const displayValue = stat?.count ?? '';

      if (end === null) {
        el.innerText = displayValue;
        return;
      }

      let start = 0;
      const increment = Math.max(Math.ceil(end / 100), 1);

      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          el.innerText = displayValue.includes(',') || /[^\d]/.test(displayValue)
            ? displayValue
            : end.toLocaleString();
          clearInterval(counter);
        } else {
          el.innerText = start.toLocaleString();
        }
      }, 30);
    });
  }, [startCount, stats]);

  if (!stats.length) {
    return null;
  }

  return (
    <div ref={sectionRef} className="w-full py-10 sm:py-12 md:py-16 summay-bg">
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 2xl:px-60 3xl:px-[300px]">
        <div className="relative z-[9999] flex w-full flex-wrap justify-center gap-4 text-center text-white sm:gap-5 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat._id || `${stat.title}-${index}`}
              className="box btn-3 hover-border-3 flex w-full flex-col items-center justify-center rounded-sm bg-primarycolor px-4 py-4 sm:w-[45%] md:w-[30%] xl:w-[180px] 3xl:w-[230px]"
            >
              <div className={roboto_slab.className}>
                <h3
                  className="text-3xl font-bold md:text-4xl"
                  data-number={parseCountNumber(stat.count) ?? ''}
                  ref={(el) => {
                    countRefs.current[index] = el;
                  }}
                >
                  0
                </h3>
              </div>
              <div>
                <h3 className="mt-1 text-sm leading-snug md:text-base">{stat.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
