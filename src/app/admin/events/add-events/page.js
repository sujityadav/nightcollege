'use client';
import React, { useState } from 'react'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import { InputText } from 'primereact/inputtext';
import TextEditor from '@/app/components/common/editor';
import { Button } from 'primereact/button';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'primereact/calendar';

export default function AddEvents() {
 
const [date, setDate] = useState(null);
  return (

    <div className="flex w-full">
      
      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='mb-3'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>Add Events</h2>
          </div>

        </div>

        <div className='bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]'>
         <div className=' px-[20px] xl:px-[250px] 3xl:px-[13.021vw]'>
          <div className='space-y-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Event Title</label>
                <InputText type="text" placeholder="Enter your title" className='border rounded-none' />
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Small Description</label>
                <InputText type="text" placeholder="Enter your title" className='border rounded-none' />
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Large Description</label>
                <TextEditor />
              </div>
              <div className='flex gap-5'> 
                <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>from (Date)</label>
               <div><Calendar value={date} onChange={(e) => setDate(e.value)}  showIcon /></div> 
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>To (Date)</label>
                 <Calendar value={date} onChange={(e) => setDate(e.value)}  showIcon />
              </div>
              <div className='flex flex-col gap-1 w-full'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Category</label>
                <InputText type="text" placeholder="Enter your title" className='border rounded-none' />
              </div>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Location</label>
                <InputText type="text" placeholder="Enter your title" className='border rounded-none' />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Photo Upload</label>

                <div className="flex border-2 border-[#b9d1ffab] border-dashed bg-[#fffef5] p-4  justify-center group relative cursor-pointer">
                  <input type="file" className="absolute left-0 right-0 top-0 bottom-0 opacity-0  cursor-pointer" />
                  <div className="text-center">
                    <Image src="/images/admin/svg/upload.svg" className="inline mb-3" width={40} height={40} alt='Upload' />
                    <p className="text-[#6C768B] xl:text-[0.730vw] mb-3"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-[0.750rem] xl:text-[0.625vw] text-[#6C768B] font-semibold mb-4">Max. File Size: 30MB</p>
                    <button className="text-white text-[0.750rem] xl:text-[0.625vw] bg-[#4FB155] border border-[#4FB155] rounded xl:py-[0.417vw] py-2 xl:px-[0.417vw] px-2 inline-block group-hover:bg-[#3f8643] group-hover:border-[#3f8643] transition duration-300 ease-in-out">
                      <i className="rdmark-table-search mr-2"></i>
                      Browse File
                    </button>
                  </div>
                </div>
              </div>
              <div className='p-2 border flex gap-5 items-center'>
                <div>
                    <Image src="/images/admin/profile_default.png" className="inline mb-3" width={135} height={160} alt='Upload' />
                    <Link href='' className='flex gap-2 item-center bg-[#A0AEC0] text-[#19212A] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500] p-[10px] xl:p-[10px] 3xl:p-[0.521vw] leading-none'>
                     <i className="pi pi-times-circle "></i> Remove Photo
                    </Link>
                </div>
                <div>
                    <Image src="/images/admin/profile_default.png" className="inline mb-3" width={135} height={160} alt='Upload' />
                    <Link href='' className='flex gap-2 item-center bg-[#A0AEC0] text-[#19212A] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500] p-[10px] xl:p-[10px] 3xl:p-[0.521vw] leading-none'>
                     <i className="pi pi-times-circle "></i> Remove Photo
                    </Link>
                </div>
                <div>
                    <Image src="/images/admin/profile_default.png" className="inline mb-3" width={135} height={160} alt='Upload' />
                    <Link href='' className='flex gap-2 item-center bg-[#A0AEC0] text-[#19212A] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500] p-[10px] xl:p-[10px] 3xl:p-[0.521vw] leading-none'>
                     <i className="pi pi-times-circle "></i> Remove Photo
                    </Link>
                </div>
                
                
                
              </div>
            </div>

            <div className='mt-[30px]'>
              <div className='flex justify-center gap-6'>
                {/* <Button label="Save" /> */}
                 <Link href='' className='cancelbtn  px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]'>
                  Cancel
                </Link>
                <Button type='submit' className='text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%] rounded-none p-button-raised'  > 
                  Save
                </Button>
              </div>
            </div>
         </div>
        </div>
      </div>
    </div>
  );
}



