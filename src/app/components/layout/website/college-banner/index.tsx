'use client';
import Image from "next/image";
import Link from "next/link";
// import GoogleTranslate from "../../../../components/GoogleTranslate/index";

export default function CollegeBanner() {

  return (
    <>
    <div className="bg-primarycolor py10 px300 ">
      <div className="flex justify-between  h-full items-center w-full">
        <div className="flex gap-2 lg:gap-5">
          <Link href="tel:02302437666" className="leading-none text-white font14 flex items-center"><i className="pi pi-phone font14 mr-2"></i> 0230 2437666</Link>
          <Link href="mailto:nightich@gmail.com" className="leading-none text-white font14  flex items-center"><i className="pi  pi-envelope font14 mr-2"></i>nightich@gmail.com</Link>
        </div>
        {/* <div className="flex gap-2 justify-end  items-center"><p className="text-white font12">Translation </p><><GoogleTranslate /> </><i className="pi pi-chevron-down text-white font12 mr-2"></i></div> */}
      </div>
    </div>
      <div className="m-auto bg-white px300 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* <Image src="/images/logo150X152.jpeg" className="text-center" width={80} height={132} alt='Upload' /> */}
                <Image src="/images/logo150X152.jpeg" className="h-auto w-[42px] shrink-0 text-center sm:w-[55px] xl:w-[70px] 3xl:w-[4.167vw]" width={80} height={132} alt="College logo" />

              <div className="min-w-0">
                <div className="flex flex-col">
                  <p className="text-[9px] font-medium leading-tight text-[#374151] sm:text-[11px] xl:text-[14px] 3xl:text-[0.729vw]">
                    Deshbhakt Babasaheb Bhausaheb Khanjire Shikshan Sanstha&apos;s
                  </p>

                  <h1 className="text-[13px] font-black leading-[110%] text-[#333] sm:text-[17px] xl:text-[26px] 3xl:text-[1.354vw]">
                    NIGHT COLLEGE OF ARTS &amp; COMMERCE, ICHALKARANJI
                  </h1>

                  <h6 className="text-[11px] font-normal leading-snug text-red-600 sm:text-[13px] xl:text-[18px] 3xl:text-[1.042vw]">
                    Affiliated to Shivaji University Kolhapur  |  Re-Accrediated By NAAC &quot;B++&quot;
                  </h6>

                </div>
              </div>
            </div></div>

          <div className="hidden shrink-0 lg:block">
            <div className="flex justify-end">
              <Image src="/images/saheb1.jpeg" className="h-auto w-[80px] text-center xl:w-[100px]" width={100} height={132} alt="College founder" />
            </div>

          </div>
        </div>

      </div>




    </>
  );
}
