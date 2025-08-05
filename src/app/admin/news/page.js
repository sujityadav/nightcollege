'use client';
import React, { useEffect, useRef, useState } from 'react'
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
import axios from 'axios';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';


export default function EventList() {
  const router = useRouter();
  const [newsData, setNewsData] = useState([]);
  const toast = useRef(null);
  
  useEffect(() => {
    const fetchNewsList = async () => {
      const response = await axios.get("/api/news");
      if (response?.data?.success) {
        setNewsData(response?.data?.data)
      }
    }
    fetchNewsList()
  }, [])

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/news/${id}`);
      if (response?.data?.success) {
        setNewsData(newsData.filter(item => item._id !== id));
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'News deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete news:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete news',
        life: 3000,
      });
    }
  }

  const actionTemplate = (product) => {
    return (
      <div className="flex  justify-center items-center gap-4 ">

        <Link href={`/admin/news/add-news?id=${product?._id}`} className="leading-none" >
          <i className="pi pi-pen-to-square text-[18px] xl:text-[0.938vw]"></i>
        </Link>
        <Link href={""} onClick={()=>handleDelete(product?._id)} className="leading-none" >            <i className="pi pi-trash text-[18px] xl:text-[0.938vw]"></i>
        </Link>
      </div>
    );
  };
  const TagsTemplate = (rowData) => {
    const tagSeverityMap = {
      Urgent: 'danger',
      Internal: 'info',
      External: 'success',
      Upcoming: 'warning',
      Completed: 'secondary'
    };

    return (
      <div className="flex flex-wrap gap-2">
        {rowData.tags?.map((tag, index) => (
          <Tag
            key={index}
            value={tag}
            severity={tagSeverityMap[tag] || null}
            rounded
          />
        ))}
      </div>
    );
  };

  const formatDate = (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-';
  return (

    <div className="grid grid-cols-1">
          <Toast ref={toast} />
      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='flex justify-between mb-5'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>News</h2>
          </div>
          <div>
            <Link href='/admin/news/add-news' className='text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[8px] xl:py-[10px] 3xl:py-[0.521vw] leading-[100%] rounded-none p-button-raised flex gap-2 items-center'>
              <i className='pi pi-plus text-[14px]'></i> Add News
            </Link>
          </div>

        </div>

        <div className='bg-white border card-shadow '>
          <div className='px-[20px] xl:px-[1.042vw] py-[14px] xl:py-[0.729vw] border-b border-[#EAEDF3]'>
            <div className="md:flex items-center gap-2 justify-between">
              <div className='flex items-center gap-4'>
                <div className="text-[#101828] text-[16px] xl:text-[0.833vw] font-medium">
                  All News
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
            <DataTable
              value={newsData}
              className="custTable tableCust"
              scrollable
              showGridlines
              responsiveLayout="scroll"
              style={{ width: "100%" }}
              paginator
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows {first} - {last} of {totalRecords}"
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onSelectionChange={(e) => setSelectedProducts(e.value)}
            >

              <Column field="Newsdata.data.title" header="Title" sortable />
              <Column field="Newsdata.data.smallDescription" header="Description" />
              <Column field="Newsdata.data.category" header="Category" />
              <Column field="Newsdata.data.location" header="Location" />

              {/* Custom Body Templates for Date Columns */}
              <Column
                header="From"
                body={(rowData) => formatDate(rowData?.Newsdata?.data?.fromDate)}
              />
              <Column
                header="To"
                body={(rowData) => formatDate(rowData?.Newsdata?.data?.toDate)}
              />

              <Column
                header="Created At"
                body={(rowData) => formatDate(rowData?.createdAt)}
              />
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
  );
}



