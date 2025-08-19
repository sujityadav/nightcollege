'use client';
import React from 'react';
import { Roboto_Slab } from 'next/font/google';

const roboto_slab = Roboto_Slab({
  weight: ['100','200','300','400','500','600','700','800','900'],
  subsets: ['latin'],
  display: 'swap',
});

export default function SubBanner({ title, breadcrumbData = [] }) {
  return (
    <div className="w-full bg-gradient-to-l from-[#af251c] to-[#c1554a] py50 mb-5 simbol-bg h-[80px] lg:h-[120px] xl:h-[150px] 3xl:h-[9.375vw]">
      <div className="px300">
        <div className={roboto_slab.className}>
          <h1 className="font-[700] font30 text-white leading-[140%]">
            {title}
          </h1>
        </div>
        {breadcrumbData.length > 0 && (
          <ul className="flex list-none space-x-2 text-white font-[400] font14">
            {breadcrumbData.map((item, index) => (
              <li key={index} className="flex items-center">
                {index !== breadcrumbData.length - 1 ? (
                  <>
                    <a href={item.url} className="hover:underline leading-none">{item.label}</a>
                    <span className="mx-2">/</span>
                  </>
                ) : (
                  <span className="font-[400]">{item.label}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
