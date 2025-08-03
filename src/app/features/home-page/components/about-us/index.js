'use client';

import React from 'react';
import { Roboto_Slab } from 'next/font/google';
import Image from 'next/image';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export default function AboutUs() {
  const items = [
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


  return (
    <div className="w-full bg-[#f8f8f8] py50 about_us_bg">
      <div className="px300">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className={roboto_slab.className}>
            <h2 className="font-[600] font26 text-primarycolor leading-[140%]">
              A Leading and Night College <br />
              with 40,000+ Students <br />
              Across the Ichalkaranji.
            </h2>

            <div className="mt-5">
              <Image
                src="/images/about-us.png"
                width={500}
                height={600}
                alt="aboutus"
                className='rounded-md border  shadow-lg'
              />
            </div>
          </div>

          <div>
            <p className="font-[400] font15 text-[#4d4d4d]">
              The Institute has come into existence as an essential need of the
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
              the Re-assessment & accreditation by NAAC in Aug.2016.
            </p>

            <div className="mt-10 divide-y divide-gray-200 w-[500px]">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-3 items-center py-3">
                  <div>
                    <div
                      className={`h-[45px] w-[45px] rounded-full flex items-center justify-center ${index === 0
                          ? 'bg-primarycolor text-white'
                          : 'border bg-white text-primarycolor'
                        }`}
                    >
                      <i className={`${item.icon} text-lg`}></i>
                    </div>
                  </div>

                  <div>
                    <h6
                      className={`font-[500] font14 leading-[140%] ${index === 0 ? 'text-[#333]' : 'text-[#003366]'
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
