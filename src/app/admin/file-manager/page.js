'use client';
import React, { useEffect, useRef, useState } from 'react'
import { InputText } from 'primereact/inputtext';
import Link from 'next/link';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";



export default function FileManager() {
  


  return (

    <div className="grid grid-cols-1">
      
      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='flex justify-between mb-5'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>All Documents</h2>
          </div>
          <div>
            <Link href='/admin/all-committees/add-committee' className='text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[8px] xl:py-[10px] 3xl:py-[0.521vw] leading-[100%] rounded-none p-button-raised flex gap-2 items-center'>
              <i className='pi pi-plus text-[14px]'></i> Add Committee
            </Link>
          </div>
        </div>
        <div className='bg-white border card-shadow '>
          <div className='px-[20px] xl:px-[1.042vw] py-[14px] xl:py-[0.729vw] border-b border-[#EAEDF3]'>
            <div className="md:flex items-center gap-2 justify-between">
              <div className='flex items-center gap-4'>
                <div className="text-[#101828] text-[16px] xl:text-[0.833vw] font-medium">
                  All Committees
                </div>
                <div className="bg-[#F6F7F9] px-[12px] xl:px-[0.625vw] py-[4px] xl:py-[0.208vw] text-[#6C768B] text-[12px] xl:text-[0.625vw] rounded-[16px] xl:rounded-[0.833vw] font-medium">
                  Display 1 to 10 of 50
                </div>
              </div>


              <div className="">
                <div className="col custSearch">
                  <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText placeholder="Search" />
                  </IconField>
                </div>

                <div>

                </div>

              </div>
            </div>

          </div>
          <div className='overflow-auto'>
           
          </div>

        </div>
      </div>
    </div>
  );
}



