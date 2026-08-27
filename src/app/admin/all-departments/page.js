'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { Toast } from 'primereact/toast';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';
import CommonDataTable from '@/app/components/common/DataTable';

export default function EventList() {
  const [departMentData, setDepartMentData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'DepartmentsData.data.sortOrder',
    sortOrder: 1,
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef(null);

  usePageBreadcrumbs({
    pageTitle: 'All Departments Management',
    breadcrumbs: [{ label: 'All Departments', isCurrent: true }],
  });

  const fetchDepartMentsList = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/departments', {
        params: {
          page: lazyParams.page,
          limit: lazyParams.rows,
          sortField: lazyParams.sortField,
          sortOrder: lazyParams.sortOrder,
          search: globalFilter,
        },
      });

      if (response?.data?.result?.success) {
        setDepartMentData(response?.data?.result?.data);
        setTotalRecords(response?.data?.result?.pagination?.totalRecords);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartMentsList();
  }, [lazyParams, globalFilter]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/departments/${id}`);
      if (response?.data?.success) {
        fetchDepartMentsList();
        toast.current.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Department deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete department',
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this department?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(id),
      reject: () => {
        toast.current.show({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Delete cancelled',
          life: 2000,
        });
      },
    });
  };

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link
        href={`/admin/all-departments/add-departments?id=${rowData?._id}`}
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
      field: 'DepartmentsData.data.title',
      header: 'Title',
      sortable: true,
      body: (rowData) => (
        <a
          href={`/admin/subjects?depatmentId=${rowData._id}`}
          style={{ color: 'blue', textDecoration: 'underline' }}
        >
          {rowData.DepartmentsData.data.title}
        </a>
      ),
      style: { minWidth: '10rem' },
    },
    {
      field: 'DepartmentsData.data.smallDescription',
      header: 'Description',
      style: { minWidth: '12rem' },
    },
    {
      field: 'DepartmentsData.data.sortOrder',
      header: 'Sort Order',
      sortable: true,
      body: (rowData) => rowData?.DepartmentsData?.data?.sortOrder ?? '-',
      style: { minWidth: '6rem' },
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
      frozen: true,
      alignFrozen: 'right',
      style: {
        minWidth: '4rem',
        background: '#fbf7dc',
        zIndex: 1,
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
            Departments
          </h2>
          <Link
            href="/admin/all-departments/add-departments"
            className="text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[8px] xl:py-[10px] 3xl:py-[0.521vw] leading-[100%] rounded-none p-button-raised flex gap-2 items-center"
          >
            <i className="pi pi-plus text-[14px]" /> Add Department
          </Link>
        </div>

        <CommonDataTable
          value={departMentData}
          columns={columns}
          loading={loading}
          totalRecords={totalRecords}
          first={lazyParams.first}
          rows={lazyParams.rows}
          sortField={lazyParams.sortField}
          sortOrder={lazyParams.sortOrder}
          onPage={(event) =>
            setLazyParams((current) => ({
              ...current,
              first: event.first,
              rows: event.rows,
              page: event.page + 1,
            }))
          }
          onSort={(event) =>
            setLazyParams((current) => ({
              ...current,
              sortField: event.sortField,
              sortOrder: event.sortOrder,
            }))
          }
          headerTitle={
            <div className="flex items-center gap-4">
              <span>All Departments</span>
              <span className="bg-[#F6F7F9] px-[12px] xl:px-[0.625vw] py-[4px] xl:py-[0.208vw] text-[#6C768B] text-[12px] xl:text-[0.625vw] rounded-[16px] xl:rounded-[0.833vw] font-medium">
                {totalRecords} Records
              </span>
            </div>
          }
          showSearch
          searchPlaceholder="Search"
          searchValue={globalFilter}
          onSearch={(event) => {
            setGlobalFilter(event.target.value);
            setLazyParams((current) => ({ ...current, page: 1, first: 0 }));
          }}
        />
      </div>
    </div>
  );
}
