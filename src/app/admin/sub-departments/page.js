'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { InputText } from 'primereact/inputtext';
import Link from 'next/link';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from 'axios';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

export default function SubDepartmentList() {
  const [eventsData, setEventsData] = useState([]);
  const toast = useRef(null);
  const searchParams = useSearchParams();
  const SubdepatmentId = searchParams.get('SubdepatmentId');

  useEffect(() => {
    const fetchDepartmentsList = async () => {
      const response = await axios.get(`/api/subdepartment`, {
        params: { SubdepatmentId: SubdepatmentId },
      });
      if (response?.data?.success) {
        setEventsData(response?.data?.data);
      }
    };
    fetchDepartmentsList();
  }, [SubdepatmentId]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/subdepartment/${id}`);
      if (response?.data?.success) {
        setEventsData(eventsData.filter(item => item._id !== id));
        toast.current.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Sub Department deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete sub department:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete sub department',
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this Sub Department?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => handleDelete(id),
    });
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="flex justify-center items-center gap-4">
        <Link
          href={`/admin/sub-departments/create-subdepartment?id=${rowData?._id}&SubdepatmentId=${SubdepatmentId}`}
          className="leading-none"
        >
          <i className="pi pi-pen-to-square text-[18px]"></i>
        </Link>
        <button onClick={() => confirmDelete(rowData?._id)} className="leading-none">
          <i className="pi pi-trash text-[18px]"></i>
        </button>
      </div>
    );
  };

  const formatDate = (value) => (value ? format(new Date(value), 'dd MMM yyyy') : '-');

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className='p-[20px] xl:p-[25px] w-full'>
        <div className='flex justify-between mb-5'>
          <h2 className='text-[#19212A] text-[14px] xl:text-[22px] font-[700] m-0'>Sub Departments</h2>
          <Link
            href={`/admin/sub-departments/create-subdepartment?SubdepatmentId=${SubdepatmentId}`}
            className='text-white border bg-primarycolor border-[#af251c] px-[14px] py-[8px] leading-[100%] rounded-none p-button-raised flex gap-2 items-center'
          >
            <i className='pi pi-plus text-[14px]'></i> Add Sub Departments
          </Link>
        </div>

        <div className='bg-white border card-shadow'>
          <div className='px-[20px] py-[14px] border-b border-[#EAEDF3]'>
            <div className="md:flex items-center gap-2 justify-between">
              <div className='flex items-center gap-4'>
                <div className="text-[#101828] text-[16px] font-medium">
                  All Sub Departments
                </div>
                <div className="bg-[#F6F7F9] px-[12px] py-[4px] text-[#6C768B] text-[12px] rounded-[16px] font-medium">
                  {eventsData.length} Records
                </div>
              </div>
              <div className="col custSearch">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search"> </InputIcon>
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
              style={{ width: "100%" }}
              paginator
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows {first} - {last} of {totalRecords}"
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            >
              <Column
                field="SubDepartmentsData.data.title"
                header="Title"
                sortable
                body={(rowData) => {
                  const title = rowData?.SubDepartmentsData?.data?.title || "-";
                  const hasActivities = rowData?.SubDepartmentsData?.data?.hasActivities;

                  return hasActivities ? (
                    <a
                      href={`/admin/departmentalactivity?subDepartmentId=${rowData._id}`}
                      style={{ color: 'blue', textDecoration: 'underline' }}
                    >
                      {title}
                    </a>
                  ) : (
                    <span>{title}</span>
                  );
                }}
              />
              <Column field="SubDepartmentsData.data.smallDescription" header="Description" />
              <Column header="Created At" body={(rowData) => formatDate(rowData?.createdAt)} />
              <Column
                header="Action"
                body={actionTemplate}
                className="action-shadow-table"
                align="center"
                style={{ minWidth: "4rem", background: "#fbf7dc", zIndex: 1 }}
              />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
