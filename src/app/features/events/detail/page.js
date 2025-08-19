'use client';

import React from "react";
import SubBanner from "../components/sub-banner";
import Image from "next/image";

const EventDetail = () => {
  const breadcrumbData = [
    { label: "Home", url: "/" },
    { label: "All Events", url: "/all-events" },
    { label: "Digital Education Market Briefing: Minnesota 2023", url: "/event-detail" }
  ];

  return (
    <>
      <SubBanner
        title="Digital Education Market Briefing: Minnesota 2023"
        breadcrumbData={breadcrumbData}
      />
      <div className="w-full py20">
        <div className="px300">
          {/* <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-4 pb20">
            <div className='title  '>
              <div> <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">Digital Education Market Briefing: Minnesota 2023 </h1>
              </div>
            </div>
          </div> */}

          <div className="py20">
            <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2 3xl:grid-cols-2 gap-6">
              <div className="object-cover">
                <div className="img-block relative overflow-hidden">
                  <Image
                    src='/images/evn-img-1.jpg'
                    width={400}
                    height={280}
                    alt="event"
                    className="w-full 3xl:w-full transition-transform duration-300 group-hover:scale-105 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex gap-3 ">
                  <div class="bg-primarycolor rounded-md p-1 text-center text-white font14 px-3"><h3>Education</h3></div>
                  <div class="bg-primarycolor rounded-md p-1 text-center text-white font14 px-3"><h3>History</h3></div>
                  <div class="bg-primarycolor rounded-md p-1 text-center text-white font14 px-3"><h3>Sports</h3></div>
                </div>
                <div className="flex gap-3 items-center">
                  <i className="pi pi-map-marker text-primarycolor"></i> <p>NewYork Sydney City</p>
                </div>
                <div className="flex gap-3 items-center">
                  <i className="pi pi-calendar text-primarycolor"></i> <p>25 Aug, 2025</p>
                </div>
              </div>
             

            </div>
             <p className="py20"> Lawyer boluptatum deleniti atque corrupti sdolores et quas molestias cepturi sint eca itate non similique sunt in culpa modi tempora incidunt obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure

Lawyer boluptatum deleniti atque corrupti sdolores et quas molestias cepturi sint eca itate non similique sunt in culpa modi tempora incidunt obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure obtain</p>
           
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetail;
