'use client';
import Image from "next/image";
import Link from "next/link";
import GoogleTranslate from "../../../../components/GoogleTranslate/index";

export default function CollegeBanner() {

  return (
    <>
    <div className="bg-primarycolor py10 px300 ">
      <div className="flex justify-between  h-full items-center w-full">
        <div className="flex gap-2 lg:gap-5">
          <Link href="tel:02302437666" className="leading-none text-white font14 flex items-center"><i className="pi pi-phone font14 mr-2"></i> 0230 2437666</Link>
          <Link href="mailto:nightich@gmail.com" className="leading-none text-white font14  flex items-center"><i className="pi  pi-envelope font14 mr-2"></i>nightich@gmail.com</Link>
        </div>
        <div className="flex gap-2 justify-end  items-center"><p className="text-white font12">Translation </p><><GoogleTranslate /> </><i className="pi pi-chevron-down text-white font12 mr-2"></i></div>
      </div>
    </div>
      <div className="bg-white px300 m-auto py-2">
        <div className="grid grid-cols-1 md:grid-cols-10 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-12 items-start">
          <div className="col-span-1 xl:col-span-10 3xl:col-span-10">
            <div className="flex gap-4 items-center">
              {/* <Image src="/images/logo150X152.jpeg" className="text-center" width={80} height={132} alt='Upload' /> */}
                <Image src="/images/logo150X152.jpeg" className="text-center w-[50px] h-[60px] 3xl:w-[4.167vw] 3xl:h-[4.2vw] " width={80} height={132}  alt='Upload' />

              <div>
                <div className="flex flex-col">
                  <p className="text-[10px] xl:text-[14px] 3xl:text-[0.729vw] font-medium text-[#374151] leading-tight">
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

          <div className="col-span-1 xl:col-span-2 3xl:col-span-2 hidden lg:block">
            <div className="flex justify-end">
              <Image src="/images/saheb1.jpeg" className="text-center" width={80} height={132} alt='Upload' />
            </div>

          </div>
        </div>

      </div>




    </>
  );
}
