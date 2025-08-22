'use client';
import React, { useEffect, useRef, useState } from 'react'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from 'primereact/tag';
import axios from 'axios';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

export default function EventList() {
  const router = useRouter();
  const [eventsData, setEventsData] = useState([]);
  const toast = useRef(null);
  const searchParams = useSearchParams();
  const subDepartmentId = searchParams.get('subDepartmentId');

  useEffect(() => {
    const fetchDepartmentsList = async () => {
      const response = await axios.get(`/api/departmentalactivity`, {
        params: { subDepartmentId: subDepartmentId },
      });
      if (response?.data?.success) {
        setEventsData(response?.data?.data);
      }
    };
    fetchDepartmentsList();
  }, []);

  // ✅ Delete request function
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/departmentalactivity/${id}`);
      if (response?.data?.success) {
        setEventsData(eventsData.filter(item => item._id !== id));
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Activity deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete activity:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete activity',
        life: 3000,
      });
    }
  };

  // ✅ Confirm dialog before deleting
  const confirmDelete = (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this activity?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(id),
    });
  };

  // ✅ Action buttons
  const actionTemplate = (product) => {
    return (
      <div className="flex justify-center items-center gap-4">
        <Link
          href={`/admin/departmentalactivity/create-departmentalactivity?id=${product?._id}&subDepartmentId=${subDepartmentId}`}
          className="leading-none"
        >
          <i className="pi pi-pen-to-square text-[18px] xl:text-[0.938vw]"></i>
        </Link>
        <button
          onClick={() => confirmDelete(product?._id)}
          className="leading-none"
        >
          <i className="pi pi-trash text-[18px] xl:text-[0.938vw]"></i>
        </button>
      </div>
    );
  };

  const formatDate = (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-';

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog /> {/* ✅ Required for confirmation dialog */}

      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='flex justify-between mb-5'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>
              Departmental Activity
            </h2>
          </div>
          <div>
            <Link
              href={`/admin/departmentalactivity/create-departmentalactivity?subDepartmentId=${subDepartmentId}`}
              className='text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[8px] xl:py-[10px] 3xl:py-[0.521vw] leading-[100%] rounded-none p-button-raised flex gap-2 items-center'
            >
              <i className='pi pi-plus text-[14px]'></i> Add Departmental Activity
            </Link>
          </div>
        </div>

        <div className='bg-white border card-shadow '>
          <div className='px-[20px] xl:px-[1.042vw] py-[14px] xl:py-[0.729vw] border-b border-[#EAEDF3]'>
            <div className="md:flex items-center gap-2 justify-between">
              <div className='flex items-center gap-4'>
                <div className="text-[#101828] text-[16px] xl:text-[0.833vw] font-medium">
                  All Departmental Activities
                </div>
                <div className="bg-[#F6F7F9] px-[12px] xl:px-[0.625vw] py-[4px] xl:py-[0.208vw] text-[#6C768B] text-[12px] xl:text-[0.625vw] rounded-[16px] xl:rounded-[0.833vw] font-medium">
                  {eventsData.length} Records
                </div>
              </div>

              <div className="col custSearch">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search"></InputIcon>
                  <InputText placeholder="Search" />
                </IconField>
              </div>
            </div>
          </div>

          <div className='overflow-auto'>
            <DataTable
              value={eventsData}
              className="custTable tableCust"
              scrollable
              showGridlines
              responsiveLayout="scroll"
              paginator
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows {first} - {last} of {totalRecords}"
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            >
              <Column
                field="DepartmentlActivityData.data.title"
                header="Title"
                sortable
              />
              <Column
                field="DepartmentlActivityData.data.smallDescription"
                header="Description"
              />
              <Column
                header="Created At"
                body={(rowData) => formatDate(rowData?.createdAt)}
              />
              <Column
                header="Action"
                body={actionTemplate}
                align="center"
                style={{
                  minWidth: "4rem",
                  background: "#fbf7dc",
                  boxShadow: "-4px 0 6px -1px rgba(0, 0, 0, 0.1)"
                }}
              />
            </DataTable> 
          </div>
        </div>
      </div>
    </div>
  );
}
