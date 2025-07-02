'use client';
import React, { useRef, useState } from 'react'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import { InputText } from 'primereact/inputtext';
import TextEditor from '@/app/components/common/editor/index';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Toast } from 'primereact/toast';
export default function AboutUs() {
  const [editorContent, setEditorContent] = useState("");
    const user = useSelector((state) => state.auth.user);
const toast = useRef(null);
  
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
   const handleEditorChange = (content) => {
    setEditorContent(content);
  };
 const extractTableData = (htmlString) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    const table = tempDiv.querySelector("table");
    if (!table) return [];

    return Array.from(table.rows).map((row) =>
      Array.from(row.cells).map((cell) => cell.textContent?.trim() || "")
    );
  };
const handleSave = async () => {
  const tableData = extractTableData(editorContent);

  if (!tableData.length) {
    return;
  }

  try {
    const response = await axios.post(
      "/api/admin",
      { data: tableData },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}` // Replace with your token logic
        }
      }
    );
toast.current.show({severity:'success', summary: 'Success', detail:'Table saved successfully ✅', life: 3000});
  } catch (error) {
    console.error("Save error:", error);
    const message =
      error.response?.data?.message || error.message || "Unknown error";
    alert(`Error saving table ❌\n${message}`);
  }
};

  return (

    <div className="flex w-full">
       <Toast ref={toast} />
      <SubSidebar title="About us" navItems={SideBarNavItems} />
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
                <InputText type="text" placeholder="Enter your title" className='rounded-none' />
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]'>Description</label>
               <TextEditor onChange={handleEditorChange} />
              </div>

            </div>


            <div className='mt-[30px]'>
              <div className='flex justify-center gap-6'>
                {/* <Button label="Save" /> */}
                 <Link href='' className='cancelbtn  px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]'>
                  Cancel
                </Link>
                <Button onClick={handleSave} type='submit' className='text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%] rounded-none p-button-raised'  > 
                  
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



