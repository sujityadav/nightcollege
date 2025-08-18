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

    const SideBarNavItems = [
    {
      label: 'Rebranding',
      href: '/admin/rebranding',
    },
    {
      label: 'Contact Information',
      href: '/admin/rebranding/contact-info',
    },
     {
     label: 'Flash Screen Popup',
      href: '/admin/rebranding/home-popup',
    },
    

  ];
 
const [date, setDate] = useState(null);
  return (

     <div className="grid grid-cols-12 md:grid-cols-10 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-7 items-start">
        <div className='col-span-1'>
    
          <SubSidebar title="Rebranding" navItems={SideBarNavItems} />
        </div>
     
      <div className='col-span-6 '>
         <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='mb-3'>
          <div className='flex justify-between'>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>Contact Information</h2>

             <Link href='/admin/rebranding' className='cancelbtn  px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]'>
                  Back
                </Link>
          </div>

        </div>

        <div className='bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]'>
          <div className=' px-[20px] lg:px-[100px] xl:px-[150px] 3xl:px-[13.021vw]'>
          <div className='space-y-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Google Location</label>
                <InputText type="text" placeholder="Enter your google location" className='border rounded-none' />
              </div>

               <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Contact Info</label>
                <TextEditor />
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
        
        </div>
   
  );
}



