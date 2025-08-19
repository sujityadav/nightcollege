'use client';
import React, { useState } from 'react'
import { InputText } from 'primereact/inputtext';
import Link from 'next/link';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown } from 'primereact/dropdown';
import Image from 'next/image';

export default function FileManager() {
  const [selectedYear, setSelectedYear] = useState(null);
  const Year = [
    { name: '2021-2022', code: 'NY' },
    { name: '2022-2023', code: 'RM' },
    { name: '2023-2024', code: 'LDN' },
    { name: '2024-2025', code: 'IST' },
    { name: '2025-2026', code: 'PRS' },
  ];

  // 8 folders data
  const folders = [
    { name: 'NAAC', created: 'Dec 13, 2020' },
    { name: 'IQAC', created: 'Jan 20, 2021' },
    { name: 'NBA', created: 'Feb 10, 2021' },
    { name: 'Library', created: 'Mar 05, 2021' },
    { name: 'Research', created: 'Apr 18, 2021' },
    { name: 'Admissions', created: 'May 30, 2021' },
    { name: 'Examinations', created: 'Jun 14, 2021' },
    { name: 'Alumni', created: 'Jul 22, 2021' },
  ];

  return (
    <div className="grid grid-cols-1">
      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='flex justify-between mb-5'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>All Documents</h2>
          </div>
          <div>
            <Link href='/admin/all-committees/add-committee' className='text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[8px] xl:py-[10px] 3xl:py-[0.521vw] leading-[100%] rounded-none p-button-raised flex gap-2 items-center'>
              <i className='pi pi-plus text-[14px]'></i> Add Folder
            </Link>
          </div>
        </div>
        <div className='bg-white border card-shadow '>
          <div className='px-[20px] xl:px-[1.042vw] py-[14px] xl:py-[0.729vw] border-b border-[#EAEDF3]'>
            <div className="md:flex items-center gap-2 justify-between">
              <div className='flex items-center gap-4'>
                <div className="text-[#101828] text-[16px] xl:text-[0.833vw] font-medium">
                  All Folders
                </div>
                <div className="bg-[#F6F7F9] px-[12px] xl:px-[0.625vw] py-[4px] xl:py-[0.208vw] text-[#6C768B] text-[12px] xl:text-[0.625vw] rounded-[16px] xl:rounded-[0.833vw] font-medium">
                  Display 1 to 8 of 8
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div>
                  <Dropdown value={selectedYear} onChange={(e) => setSelectedYear(e.value)} options={Year} optionLabel="name" placeholder="Select a year" className="w-14rem" />
                </div>
                <div className="col custSearch">
                  <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"></InputIcon>
                    <InputText placeholder="Search" />
                  </IconField>
                </div>
              </div>
            </div>
          </div>

          <div className='overflow-auto p20'>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 3xl:grid-cols-6 gap-6">
              {folders.map((folder, index) => (
                <div key={index} className='border p-3 rounded-md bg-gray-50 shadow-md'>
                  <Link href=''>
                    <div className='text-center pb20 border-b'>
                      <Image
                        src='/images/open-folder.png'
                        width={64}
                        height={64}
                        alt="folder"
                        className='m-auto'
                      />
                    </div>
                  </Link>
                  <div className='mt-2 space-y-3'>
                    <div className='flex'>
                      <p className='font12 text-gray-600'>Created on {folder.created}</p>
                    </div>
                    <div className='flex gap-2 justify-between'>
                      <h1 className='font-[500]'>{folder.name}</h1>
                      <Link href=''><i className='pi pi-trash text-primarycolor'></i></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
