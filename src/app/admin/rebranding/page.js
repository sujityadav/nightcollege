'use client';
import React, { useState } from 'react'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import { InputText } from 'primereact/inputtext';
import TextEditor from '@/app/components/common/editor';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from 'primereact/tag';
import { InputSwitch } from 'primereact/inputswitch';
import Image from 'next/image';


export default function Rebranding() {
     const [checked, setChecked] = useState(true);
  const list = [
    {
      id: 1,
      title: "Sport Events",
      smalldescription: "META",
      sortno:'1',
      description: "Infrastructure upgrade for META's global data centers.",
      from: "01/06/2025",
      to: "31/06/2025",
    
    },
   {
      id: 2,
      title: "Sport Events",
      smalldescription: "META",
      sortno:'2',
      description: "Infrastructure upgrade for META's global data centers.",
      from: "01/06/2025",
      to: "31/06/2025",
    
    },
  ];


  const actionTemplate = (product) => {
    return (
      <div className="flex  justify-center items-center gap-4 ">

        <Link href={""} className="leading-none" >
          <i className="pi pi-pen-to-square text-[18px] xl:text-[0.938vw]"></i>
        </Link>
        <Link href={""} className="leading-none" >            <i className="pi pi-trash text-[18px] xl:text-[0.938vw]"></i>
        </Link>
      </div>
    );
  };
  const StatusTemplate = (rowData) => {
  return (
    <div className="flex flex-wrap gap-2">
           <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
    </div>
  );
};
  const BannerPic = (rowData) => {
  return (
    <div className="flex flex-wrap gap-2">
          <Image src="/images/admin/profile_banner.png" className="inline mb-3" width={300} height={150} alt='title' />
    </div>
  );
};

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
  return (
    
<>
  <div className="grid grid-cols-12 md:grid-cols-10 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-7 items-start">
    <div className='col-span-1'>

      <SubSidebar title="Rebranding" navItems={SideBarNavItems} />
    </div>
 
  <div className='col-span-6 '>
      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='flex justify-between mb-5'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>Banners</h2>
          </div>
          <div>
            <Link href='/admin/rebranding/add-banners' className='text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[8px] xl:py-[10px] 3xl:py-[0.521vw] leading-[100%] rounded-none p-button-raised flex gap-2 items-center'>
              <i className='pi pi-plus text-[14px]'></i> Add
            </Link>
          </div>

        </div>

        <div className='bg-white border card-shadow '>
          <div className='px-[20px] xl:px-[1.042vw] py-[14px] xl:py-[0.729vw] border-b border-[#EAEDF3]'>
            <div className="md:flex items-center gap-2 justify-between">
              <div className='flex items-center gap-4'>
                <div className="text-[#101828] text-[16px] xl:text-[0.833vw] font-medium">
                 All Banners
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
            <DataTable value={list}
              className="custTable tableCust"
              scrollable
              showGridlines
              responsiveLayout="scroll"
              style={{ width: "100%" }}
              paginator
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows per page {first}-{last} of {totalRecords}"
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onSelectionChange={(e) => setSelectedProducts(e.value)}

            >

              <Column
                field="id"
                header="Sr.No."
                sortable
                style={{ minWidth: "1rem" }}
                alignHeader='center'
               
              ></Column>
              <Column
                field="bannerpicture"
                header="Banner Picture"
                sortable
                 body={BannerPic}
                style={{ minWidth: "12rem" }}
              ></Column>
              <Column
                field="sortno"
                header="Sort Number"
                sortable
                style={{ minWidth: "3rem" }}
              ></Column>
              <Column
                field="title"
                header="Banner Title"
                sortable
                style={{ minWidth: "15rem" }}
              ></Column>
              <Column
                field="description"
                header="Banner Description"
                sortable
                style={{ minWidth: "16rem" }}
              ></Column>
              <Column
                field="Status"
                header="Status"
                sortable
                body={StatusTemplate}
              />
              <Column
                field="from"
                header="from (Date)"
                sortable
                style={{ minWidth: "7rem" }}
              ></Column>
              <Column
                field="to"
                header="To (Date)"
                sortable
                style={{ minWidth: "7rem" }}
              ></Column>
               <Column
                field="action"
                header="Action"
                className="action-shadow-table"
                frozen
                alignFrozen="right"
                align="center"
                body={actionTemplate}
                style={{ minWidth: "4rem", background: "#fbf7dc", zIndex: 1, boxShadow: "-4px 0 6px -1px rgba(0, 0, 0, 0.1); " }}
              ></Column>
            </DataTable>
          </div>

        </div>
      </div>
      </div>
    
    </div>



    
</>
  );
}



