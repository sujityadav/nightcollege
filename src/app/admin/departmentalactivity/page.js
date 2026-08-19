'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CommonDataTable from '@/app/components/common/DataTable';

export default function EventList() {
  const [eventsData, setEventsData] = useState([]);
  const [search, setSearch] = useState('');
  const toast = useRef(null);
  const searchParams = useSearchParams();
  const subDepartmentId = searchParams.get('subDepartmentId');

  useEffect(() => {
    const fetchDepartmentsList = async () => {
      const response = await axios.get('/api/departmentalactivity', {
        params: { subDepartmentId },
      });
      if (response?.data?.success) {
        setEventsData(response?.data?.data);
      }
    };
    fetchDepartmentsList();
  }, [subDepartmentId]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return eventsData;
    const query = search.toLowerCase();
    return eventsData.filter((item) => {
      const title = item?.DepartmentlActivityData?.data?.title?.toLowerCase() || '';
      const description = item?.DepartmentlActivityData?.data?.smallDescription?.toLowerCase() || '';
      return title.includes(query) || description.includes(query);
    });
  }, [eventsData, search]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/departmentalactivity/${id}`);
      if (response?.data?.success) {
        setEventsData(eventsData.filter((item) => item._id !== id));
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

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link
        href={`/admin/departmentalactivity/create-departmentalactivity?id=${rowData?._id}&subDepartmentId=${subDepartmentId}`}
        className="leading-none"
      >
        <i className="pi pi-pen-to-square text-[18px] xl:text-[0.938vw]" />
      </Link>
      <button
        type="button"
        onClick={() => confirmDelete(rowData?._id)}
        className="leading-none bg-transparent border-0 cursor-pointer text-red-500"
      >
        <i className="pi pi-trash text-[18px] xl:text-[0.938vw]" />
      </button>
    </div>
  );

  const formatDate = (value) => (value ? format(new Date(value), 'dd MMM yyyy') : '-');

  const columns = [
    {
      field: 'DepartmentlActivityData.data.title',
      header: 'Title',
      sortable: true,
      style: { minWidth: '10rem' },
    },
    {
      field: 'DepartmentlActivityData.data.smallDescription',
      header: 'Description',
      style: { minWidth: '12rem' },
    },
    {
      header: 'Created At',
      body: (rowData) => formatDate(rowData?.createdAt),
      style: { minWidth: '8rem' },
    },
    {
      header: 'Action',
      body: actionTemplate,
      align: 'center',
      style: {
        minWidth: '4rem',
        background: '#fbf7dc',
        boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full">
        <div className="flex justify-between mb-5">
          <h2 className="text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0">
            Departmental Activity
          </h2>
          <Link
            href={`/admin/departmentalactivity/create-departmentalactivity?subDepartmentId=${subDepartmentId}`}
            className="text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[8px] xl:py-[10px] 3xl:py-[0.521vw] leading-[100%] rounded-none p-button-raised flex gap-2 items-center"
          >
            <i className="pi pi-plus text-[14px]" /> Add Departmental Activity
          </Link>
        </div>

        <CommonDataTable
          value={filteredData}
          columns={columns}
          lazy={false}
          totalRecords={filteredData.length}
          headerTitle={
            <div className="flex items-center gap-4">
              <span>All Departmental Activities</span>
              <span className="bg-[#F6F7F9] px-[12px] xl:px-[0.625vw] py-[4px] xl:py-[0.208vw] text-[#6C768B] text-[12px] xl:text-[0.625vw] rounded-[16px] xl:rounded-[0.833vw] font-medium">
                {filteredData.length} Records
              </span>
            </div>
          }
          showSearch
          searchPlaceholder="Search here.."
          searchValue={search}
          onSearch={(event) => setSearch(event.target.value)}
        />
      </div>
    </div>
  );
}
