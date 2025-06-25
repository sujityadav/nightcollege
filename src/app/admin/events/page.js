'use client';
import React, { useState } from 'react'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import { InputText } from 'primereact/inputtext';
import TextEditor from '@/app/components/common/editor';
import { Button } from 'primereact/button';
import Link from 'next/link';

export default function AboutUs() {


  return (

    <div className="flex w-full">
     
      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='mb-3'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>About Us</h2>
          </div>

        </div>

        <div className='bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]'>
          <div className=' px-[20px] xl:px-[250px] 3xl:px-[13.021vw]'>
            <div className='space-y-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Title</label>
                <InputText type="text" placeholder="Enter your title" className='border rounded-md' />
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Description</label>
                <TextEditor />
              </div>

            </div>


            <div className='mt-[30px]'>
              <div className='flex justify-center gap-6'>
                {/* <Button label="Save" /> */}
                 <Link href='' className='cancelbtn  px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]'>
                  Cancel
                </Link>
                <button type='submit' className='text-white border bg-[#af251c] border-[#af251c] px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]'>
                  Save
                </button>
               
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}



