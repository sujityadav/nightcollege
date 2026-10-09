'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CommonDataTable from '@/app/components/common/DataTable';

const actionColumnStyle = {
  minWidth: '4rem',
  background: '#fbf7dc',
  zIndex: 1,
  boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1)',
};

export default function AllStaffPage() {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    search: '',
    sortField: 'createdAt',
    sortOrder: -1,
  });
  const toast = useRef(null);

  const fetchStaffList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/stafs', {
        params: {
          page: lazyParams.page,
          limit: lazyParams.rows,
          sortField: lazyParams.sortField,
          sortOrder: lazyParams.sortOrder,
          search: lazyParams.search,
        },
      });

      if (response?.data?.success) {
        setStaffData(response.data.data || []);
        setTotalRecords(response.data.totalRecords || 0);
      }
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch staff',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [lazyParams]);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/stafs/${id}`);
      if (response?.data?.success) {
        fetchStaffList();
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Staff deleted successfully',
          life: 3000,
        });
      }
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete staff',
        life: 3000,
      });
    }
  };

  const confirmDelete = (rowData) => {
    const name = rowData?.StaffData?.data?.name || 'this staff member';
    confirmDialog({
      header: 'Delete Staff',
      message: `Are you sure you want to delete "${name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(rowData._id),
    });
  };

  const formatDate = (value) => (value ? format(new Date(value), 'dd MMM yyyy') : '-');

  const columns = [
    {
      header: 'Photo',
      body: (rowData) => {
        const photoUrl = rowData?.StaffData?.data?.photo;
        if (!photoUrl) {
          return <span className="text-gray-400 text-sm">No Photo</span>;
        }
        return (
          <img
            src={photoUrl}
            alt={rowData?.StaffData?.data?.name || 'Staff photo'}
            className="h-14 w-14 rounded-full object-cover"
          />
        );
      },
      style: { minWidth: '5rem' },
    },
    {
      header: 'Name',
      sortable: true,
      sortField: 'StaffData.data.name',
      body: (rowData) => rowData?.StaffData?.data?.name || '-',
      style: { minWidth: '10rem' },
    },
    {
      header: 'Designation',
      sortable: true,
      sortField: 'StaffData.data.designation',
      body: (rowData) => rowData?.StaffData?.data?.designation || '-',
      style: { minWidth: '10rem' },
    },
    {
      header: 'Type',
      sortable: true,
      sortField: 'StaffData.data.staffType',
      body: (rowData) => rowData?.StaffData?.data?.staffType || '-',
      style: { minWidth: '8rem' },
    },
    {
      header: 'Created At',
      sortable: true,
      sortField: 'createdAt',
      body: (rowData) => formatDate(rowData?.createdAt),
      style: { minWidth: '8rem' },
    },
    {
      header: 'Action',
      body: (rowData) => (
        <div className="flex justify-center items-center gap-4">
          <Link
            href={`/admin/all-staff/add-staff?id=${rowData._id}`}
            className="leading-none"
            title="Edit"
          >
            <i className="pi pi-pen-to-square text-[18px]" />
          </Link>
          <button
            type="button"
            onClick={() => confirmDelete(rowData)}
            className="leading-none bg-transparent border-0 cursor-pointer text-red-500 p-0"
            title="Delete"
          >
            <i className="pi pi-trash text-[18px]" />
          </button>
        </div>
      ),
      align: 'center',
      style: actionColumnStyle,
    },
  ];

  return (
    <div className="min-w-0 flex-1 p-5">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-between mb-5">
        <h2 className="text-[#19212A] text-[22px] font-[700] m-0">All Staff</h2>
        <Link
          href="/admin/all-staff/add-staff"
          className="text-white border bg-primarycolor border-[#af251c] px-[14px] py-[8px] flex gap-2 items-center"
        >
          <i className="pi pi-plus text-[14px]" /> Add Staff
        </Link>
      </div>

      <CommonDataTable
        value={staffData}
        columns={columns}
        loading={loading}
        lazy
        totalRecords={totalRecords}
        first={lazyParams.first}
        rows={lazyParams.rows}
        sortField={lazyParams.sortField}
        sortOrder={lazyParams.sortOrder}
        onPage={(event) =>
          setLazyParams((params) => ({
            ...params,
            first: event.first,
            rows: event.rows,
            page: event.page + 1,
          }))
        }
        onSort={(event) =>
          setLazyParams((params) => ({
            ...params,
            sortField: event.sortField,
            sortOrder: event.sortOrder,
            first: 0,
            page: 1,
          }))
        }
        headerTitle="All Staff"
        showSearch
        searchPlaceholder="Search here.."
        searchValue={lazyParams.search}
        onSearch={(event) =>
          setLazyParams((params) => ({
            ...params,
            search: event.target.value,
            first: 0,
            page: 1,
          }))
        }
        dataTableProps={{ dataKey: '_id' }}
      />
    </div>
  );
}
