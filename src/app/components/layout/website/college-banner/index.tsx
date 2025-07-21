'use client';
import Image from "next/image";
import Link from "next/link";


export default function CollegeBanner() {

  return (
    <>
      <div className="bg-white px300 m-auto py-2">
        <div className="grid grid-cols-12 md:grid-cols-10 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-12 items-start">
          <div className="col-span-1 xl:col-span-10 3xl:col-span-10">
            <div className="flex gap-4">
              <Image src="/images/logo150X152.jpeg" className="text-center" width={80} height={132} alt='Upload' />


              <div>
                <div className="flex flex-col">
                  <p className="text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-medium text-[#374151] leading-tight">
                    Deshbhakt Babasaheb Bhausaheb Khanjire Shikshan Sanstha&apos;s
                  </p>

                  <h1 className="text-[14px] xl:text-[26px] 3xl:text-[1.354vw] font-black leading-[100%] text-[#333]">
                    NIGHT COLLEGE OF ARTS &amp; COMMERCE, ICHALKARANJI
                  </h1>

                  <h6 className="text-[14px] xl:text-[18px] 3xl:text-[1.042vw] font-normal text-red-600">
                    Affiliated to Shivaji University Kolhapur  |  Re-Accrediated By NAAC &quot;B++&quot;
                  </h6>

                </div>
              </div>
            </div></div>

          <div className="col-span-1 xl:col-span-2 3xl:col-span-2">
            <div className="flex justify-end">
              <Image src="/images/saheb1.jpeg" className="text-center" width={80} height={132} alt='Upload' />
            </div>

          </div>
        </div>

      </div>




    </>
  );
}
