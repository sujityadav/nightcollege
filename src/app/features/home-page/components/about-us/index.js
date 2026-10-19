'use client';

import React, { useEffect, useState } from 'react';
import { Roboto_Slab } from 'next/font/google';
import Image from 'next/image';
import axios from 'axios';
import 'suneditor/dist/css/suneditor.min.css';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const DEFAULT_TITLE =
  'A Leading and Night College with 40,000+ Students Across the Ichalkaranji.';
const DEFAULT_DESCRIPTION = `The Institute has come into existence as an essential need of the
              neighborhood society, specially working community in 1983.
              Accordingly three dimensional HE-Formal, Open (ODL) and Extension
              mode is offered with utility specialization and entire flexible
              mobility. As per vision, since last 30 years, the institute has
              been pursuing to empower the deprived weaker, workers, minority
              men and woman sections of the society and it has achieved great
              success by adopting distinctive motto ‘Work is Worship’ The
              Institute is affiliated to Shivaji university, Kolhapur and is
              eligible to receive assistance from U.G.C. under section 2F & 12 B
              of the U.G.C. Act of 1956. The institution achieved “B” Grade in
              the Re-assessment & accreditation by NAAC in Aug.2016.`;

const STATIC_ITEMS = [
  {
    id: 1,
    title: 'Quality Education & Skill Development',
    icon: 'pi pi-book',
  },
  {
    id: 2,
    title: 'Inclusive Learning Opportunities',
    icon: 'pi pi-pencil',
  },
  {
    id: 3,
    title: 'Networking & Connections',
    icon: 'pi pi-share-alt',
  },
  {
    id: 4,
    title: 'Personal Growth & Independence',
    icon: 'pi pi-user-plus',
  },
  {
    id: 5,
    title: 'Access to Research & Innovation',
    icon: 'pi pi-search-plus',
  },
];

export default function AboutUs() {
  const [content, setContent] = useState({
    title: DEFAULT_TITLE,
    descriptionHtml: '',
    photo: '/images/about-us.png',
  });
  const [useHtmlDescription, setUseHtmlDescription] = useState(false);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const response = await axios.get('/api/about-us/public', { params: { type: 'about' } });
        const data = response.data?.data;
        if (!data) return;

        setContent({
          title: data.title?.trim() || DEFAULT_TITLE,
          descriptionHtml: data.content || '',
          photo: data.photo || '/images/about-us.png',
        });
        setUseHtmlDescription(Boolean(data.content?.trim()));
      } catch {
        // Keep defaults
      }
    };

    loadAbout();
  }, []);

  return (
    <div className="about_us_bg w-full bg-[#f8f8f8] py50">
      <div className="px300">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          <div className={roboto_slab.className}>
            <h2 className="font26 font-[600] leading-[140%] text-primarycolor whitespace-pre-line">
              {content.title}
            </h2>

            <div className="mt-5">
              <Image
                src={content.photo}
                width={500}
                height={600}
                alt="About us"
                unoptimized
                className="h-auto w-full max-w-[500px] rounded-md border shadow-lg"
              />
            </div>
          </div>

          <div className="md:pt-1">
            {useHtmlDescription ? (
              <div
                className="quick-link-content font15 font-[400] text-[#4d4d4d]"
                dangerouslySetInnerHTML={{ __html: content.descriptionHtml }}
              />
            ) : (
              <p className="font15 font-[400] text-[#4d4d4d]">{DEFAULT_DESCRIPTION}</p>
            )}

            <div className="mt-7 w-full divide-y divide-gray-200 sm:mt-10 xl:w-[400px] 3xl:w-[26.042vw]">
              {STATIC_ITEMS.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div>
                    <div
                      className={`flex h-[45px] w-[45px] items-center justify-center rounded-full ${
                        index === 0
                          ? 'bg-primarycolor text-white'
                          : 'border bg-white text-primarycolor'
                      }`}
                    >
                      <i className={`${item.icon} text-lg`}></i>
                    </div>
                  </div>

                  <div>
                    <h6
                      className={`font14 font-[500] leading-[140%] ${
                        index === 0 ? 'text-[#333]' : 'text-[#003366]'
                      }`}
                    >
                      {item.title}
                    </h6>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
