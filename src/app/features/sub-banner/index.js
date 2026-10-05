'use client';
import React from 'react';
import { Roboto_Slab } from 'next/font/google';

const roboto_slab = Roboto_Slab({
  weight: ['100','200','300','400','500','600','700','800','900'],
  subsets: ['latin'],
  display: 'swap',
});

/**
 * @param {{ title: string; subtitle?: string; breadcrumbData?: Array<{ label: string; url: string }> }} props
 */
export default function SubBanner({ title, subtitle, breadcrumbData = [] }) {
  return (
    <section
      className="relative mb-5 min-h-[120px] overflow-hidden bg-cover bg-center sm:min-h-[145px] lg:min-h-[170px]"
      style={{ backgroundImage: "url('/images/silder1.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#8F1715]/95 via-[#AB2821]/72 to-[#7D160F]/35" aria-hidden="true" />
      <div className="relative z-10 px300 flex min-h-[120px] flex-col justify-center py-6 sm:min-h-[145px] lg:min-h-[170px]">
        {breadcrumbData.length > 0 && (
          <ul className="mb-2 flex flex-wrap list-none items-center gap-y-1 text-white font14">
            <li className="mr-2 flex items-center"><i className="pi pi-home mr-2 text-[11px]" aria-hidden="true" /></li>
            {breadcrumbData.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center">
                {index !== breadcrumbData.length - 1 ? <><a href={item.url} className="leading-none hover:underline">{item.label}</a><span className="mx-2 text-white/75">›</span></> : <span className="font-[400]">{item.label}</span>}
              </li>
            ))}
          </ul>
        )}
        <div className={roboto_slab.className}>
          <h1 className="font-[700] font30 text-white leading-[120%]">{title}</h1>
          {subtitle ? <p className="mt-1 text-xs font-medium tracking-wide text-white/90 sm:text-sm">{subtitle}</p> : null}
          <div className="mt-2 h-[2px] w-10 bg-white/80" />
        </div>
      </div>
    </section>
  );
}
