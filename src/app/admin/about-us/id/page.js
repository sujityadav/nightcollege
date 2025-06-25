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
  const SideBarNavItems = [
    {
      label: 'About Us',
      href: '/admin/about-us',
    },
    {
      label: 'Colege at a Glance',
      href: '/admin/about-us/colege-glance',
    },
    {
      label: 'Vision & Mission ',
      href: '/admin/about-us/vision-mission',

    },
    {
      label: 'Principal Desk',
      href: '/admin/about-us/principal-desk',
    },
    {
      label: 'Institutional Development Plan (IDP)',
      href: '/admin/about-us/idp',
    },
    {
      label: 'Institutional Distinctiveness',
      href: '/admin/about-us/id',
    },

  ];

  return (

    <div className="flex w-full">
      <SubSidebar title="About us" navItems={SideBarNavItems} />
      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='mb-3'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>Institutional Development Plan (IDP)</h2>
          </div>

        </div>

        <div className='bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]'>
          <div className=' px-[20px] xl:px-[250px] 3xl:px-[13.021vw]'>
            <div className='space-y-3'>
              

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



