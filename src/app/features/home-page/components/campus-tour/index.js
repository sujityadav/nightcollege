'use client';

import React, { useEffect, useState } from 'react';
import { Roboto_Slab } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { pickRandomGalleryThumbnails } from '@/app/utils/pickRandomGalleryThumbnails';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export default function CampusTour() {
  const [tourImages, setTourImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/gallery/public');
        if (cancelled) return;
        const albums = response.data?.success ? response.data.data || [] : [];
        setTourImages(pickRandomGalleryThumbnails(albums));
      } catch {
        if (!cancelled) setTourImages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full py50 bg-[#f8f8f8]">
      <div className="">
        <div className="title pb30 px300">
          <div className={roboto_slab.className}>
            <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">
              Take a Campus Tour
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 3xl:grid-cols-5 items-start mt-5">
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div
                key={`campus-tour-skeleton-${index}`}
                className="img-block relative aspect-[4/3] w-full animate-pulse bg-[#e5e7eb]"
              />
            ))
          ) : tourImages.length === 0 ? (
            <p className="col-span-full px300 text-center text-[#6C768B]">
              Gallery images will appear here soon.
            </p>
          ) : (
            tourImages.map((item) => (
              <Link
                key={item.key}
                href="/images-gallery"
                className="group"
                aria-label="View images gallery"
              >
                <div className="img-block relative overflow-hidden aspect-[4/3] w-full">
                  <Image
                    src={item.url}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Link
            href="/images-gallery"
            className="my-button shadow-2xl px20 py10 bg-primarycolor rounded-sm cursor-pointer relative overflow-hidden"
          >
            <span className="text-center text-white font15 font-[500] my-auto">View More</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
