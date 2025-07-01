'use client';
import Image from "next/image";
import Link from "next/link";


export default function CollegeBanner() {
 
  return (
    <>
      <div className="bg-white px-[300px] m-auto py-2">
         <div className="grid grid-cols-12 md:grid-cols-10 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-12 items-start">
            <div className="col-span-1 ">
                   <Image src="/images/logo150X152.jpeg" className="text-center" width={80} height={132} alt='Upload' />

            </div>
            <div className="col-span-10">
                    <div className="flex flex-col">
                        <p className="text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]  text-[#374151] leading-tight">Deshbhakt Babasaheb Bhausaheb Khanjire Shikshan Sanstha's</p>
                        <h1 className="text-[14px] xl:text-[26px] 3xl:text-[1.354vw] font-[900] leading-[100%] text-[#333]">NIGHT COLLEGE OF ARTS & COMMERCE, ICHALKARANJI</h1>

                        <h6 className="text-[14px] xl:text-[18px] 3xl:text-[1.042vw] font-[400] text-red-600">Affiliated to Shivaji University Kolhapur  |  Re-Accrediated By NAAC "B++"</h6>
                    </div>
            </div>
            <div className="col-span-1 ">
                <div className="flex justify-end">
                   <Image src="/images/saheb1.jpeg" className="text-center" width={80} height={132} alt='Upload' />
                   </div>

            </div>
         </div>
        
      </div>

      

     
    </>
  );
}
