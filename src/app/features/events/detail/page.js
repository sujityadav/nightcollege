'use client';
import SubBanner from "../components/sub-banner";
import PhotoGalleria from "../../../components/galleria/index";


const EventDetail = () => {
  const breadcrumbData = [
    { label: "Home", url: "/" },
    { label: "All Events", url: "/all-events" },
    { label: "Digital Education Market Briefing: Minnesota 2023", url: "/event-detail" }
  ];

   const imageData = [
    { itemImageSrc: '/images/evn-img-1.jpg', thumbnailImageSrc: '/images/evn-img-1-thumb.jpg', alt: 'Event Image 1', title: 'Event Photo 1' },
    { itemImageSrc: '/images/g1.png', thumbnailImageSrc: '/images/g1.png', alt: 'Event Image 2', title: 'Event Photo 2' },
    { itemImageSrc: '/images/g2.jpg', thumbnailImageSrc: '/images/g2.jpg', alt: 'Event Image 3', title: 'Event Photo 3' },
    { itemImageSrc: '/images/g3.png', thumbnailImageSrc: '/images/g3.png', alt: 'Event Image 4', title: 'Event Photo 4' }
  ];

  return (
    <>
      <SubBanner
        title="Digital Education Market Briefing: Minnesota 2023"
        breadcrumbData={breadcrumbData}
      />
      <div className="w-full py20">
        <div className="px300">
          <div className="py20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-3 gap-6">
              <div className="object-cover xl:col-span-3 3xl:col-span-2">
                <div className="card galleria-demo">
                 <PhotoGalleria images={imageData}  height="600px"   />

      
                </div>
              </div>
              <div className="space-y-5 col-span-1">
                <div className="flex gap-3 ">
                  <div className="bg-primarycolor rounded-md p-1 text-center text-white font14 px-3"><h3>Education</h3></div>
                  <div className="bg-primarycolor rounded-md p-1 text-center text-white font14 px-3"><h3>History</h3></div>
                  <div className="bg-primarycolor rounded-md p-1 text-center text-white font14 px-3"><h3>Sports</h3></div>
                </div>
                <div className="flex gap-3 items-center">
                  <i className="pi pi-map-marker text-primarycolor"></i> <p>NewYork Sydney City</p>
                </div>
                <div className="flex gap-3 items-center">
                  <i className="pi pi-calendar text-primarycolor"></i> <p>25 Aug, 2025</p>
                </div>

                <div>
                  <p>Lawyer boluptatum deleniti atque corrupti sdolores et quas molestias cepturi sint eca itate non similique sunt in culpa modi tempora incidunt obtain</p>
                </div>
              </div>
            </div>
            <p className="py20">
              Lawyer boluptatum deleniti atque corrupti sdolores et quas molestias cepturi sint eca itate non similique sunt in culpa modi tempora incidunt obtain pain of itself...
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetail;
