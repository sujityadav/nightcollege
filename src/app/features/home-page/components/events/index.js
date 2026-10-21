'use client';

import { useEffect, useState } from 'react';
import { Roboto_Slab } from 'next/font/google';
import Link from 'next/link';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import EventCard from '@/app/components/events/EventCard';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const HOME_EVENTS_LIMIT = 8;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const ArrowStyle =
    'bg-[#9e1c1c] w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform ';

  const NextArrow = ({ onClick }) => (
    <div
      className="absolute top-1/2 -translate-y-1/2 right-[-50px] z-10 hidden cursor-pointer md:block lg:block xl:block 2xl:block 3xl:block"
      onClick={onClick}
    >
      <div className={ArrowStyle}>
        <span className="text-white"><i className="pi pi-angle-right text-lg" /></span>
      </div>
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div
      className="absolute top-1/2 -translate-y-1/2 left-[-50px] z-10 hidden cursor-pointer md:block lg:block xl:block 2xl:block 3xl:block"
      onClick={onClick}
    >
      <div className={ArrowStyle}>
        <span className="text-white text-xl"><i className="pi pi-angle-left text-lg" /></span>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/events/public', {
          params: { limit: HOME_EVENTS_LIMIT, page: 1, year: '' },
        });
        if (response.data?.success) {
          setEvents(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to load homepage events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const settings = {
    dots: false,
    infinite: events.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, events.length || 1),
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(2, events.length || 1) },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="w-full py50">
      <div className="px300">
        <div className="title pb30">
          <div className={roboto_slab.className}>
            <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">Latest Events</h1>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="aspect-[4/3] animate-pulse bg-[#e8edf5]" />
            ))}
          </div>
        ) : !events.length ? (
          <p className="text-sm text-[#6C768B]">No events to display at the moment.</p>
        ) : (
          <Slider {...settings}>
            {events.map((event) => (
              <div key={event.id} className="flex h-full px-2 sm:px-3 lg:px-4">
                <EventCard event={event} className="h-full w-full" />
              </div>
            ))}
          </Slider>
        )}

        <div className="mt20 flex justify-center text-center">
          <Link
            href="/events/all-events"
            className="my-button relative cursor-pointer overflow-hidden rounded-sm bg-primarycolor px20 py10 shadow-2xl"
          >
            <span className="my-auto text-center font15 font-[500] text-white">View More</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
