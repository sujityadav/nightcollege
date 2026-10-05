'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { InputSwitch } from 'primereact/inputswitch';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';
import CommonDataTable from '@/app/components/common/DataTable';
import {
  getFirstImageFromAttachments,
  hasAttachments,
} from '@/app/components/common/MediaUpload';
import { getDefaultListYearFilterValue } from '@/app/lib/listYearFilterOptions';

const DATA_KEY = 'InfrastructureFacilitiesData';

export default function InfrastructureFacilitiesList() {
  usePageBreadcrumbs({
    pageTitle: 'Infrastructure Facilities',
    pathLabels: {
      '/admin': 'Dashboard',
      '/admin/infrastructure-facilities': 'Infrastructure Facilities',
    },
  });

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState(() => getDefaultListYearFilterValue());
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'createdAt',
    sortOrder: -1,
  });
  const toast = useRef(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/infrastructure-facilities', {
        params: {
          search,
          year: yearFilter || undefined,
          page: lazyParams.page,
          limit: lazyParams.rows,
          sortField: lazyParams.sortField,
          sortOrder: lazyParams.sortOrder,
        },
      });
      if (response?.data?.success) {
        setRows(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch infrastructure facilities',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [lazyParams, search, yearFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  const fileTemplate = (rowData) => {
    const attachments = rowData?.[DATA_KEY]?.data?.attachments;
    const imageUrl = getFirstImageFromAttachments(attachments);

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={rowData?.[DATA_KEY]?.data?.title || 'Infrastructure'}
          className="h-14 w-24 rounded object-cover"
        />
      );
    }

    if (hasAttachments(attachments)) {
      return (
        <div
          className="flex h-14 w-24 items-center justify-center rounded border border-[#EAEDF3] bg-[#F9FAFB] text-primarycolor"
          title="File attached"
        >
          <i className="pi pi-file text-[22px]" />
        </div>
      );
    }

    return <span className="text-gray-400 text-sm">No File</span>;
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/infrastructure-facilities/${id}`);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Record deleted successfully',
      });
      fetchList();
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete record',
      });
    }
    setDeleteDialogVisible(false);
  };

  const handleStatusToggle = async (rowData, checked) => {
    const newStatus = checked ? 1 : 0;
    const previousStatus = Number(rowData?.[DATA_KEY]?.data?.status ?? 0);

    setRows((prev) =>
      prev.map((item) =>
        item._id === rowData._id
          ? {
              ...item,
              [DATA_KEY]: {
                ...item[DATA_KEY],
                data: { ...item[DATA_KEY]?.data, status: newStatus },
              },
            }
          : item
      )
    );
    setUpdatingStatusId(rowData._id);

    try {
      const response = await axios.put(`/api/infrastructure-facilities/${rowData._id}`, {
        data: { ...rowData[DATA_KEY]?.data, status: newStatus },
      });
      if (!response?.data?.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Marked as ${newStatus === 1 ? 'active' : 'inactive'}`,
        life: 2500,
      });
    } catch {
      setRows((prev) =>
        prev.map((item) =>
          item._id === rowData._id
            ? {
                ...item,
                [DATA_KEY]: {
                  ...item[DATA_KEY],
                  data: { ...item[DATA_KEY]?.data, status: previousStatus },
                },
              }
            : item
        )
      );
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update status', life: 3000 });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const columns = [
    { header: 'File', body: fileTemplate, style: { minWidth: '7rem' } },
    {
      field: 'InfrastructureFacilitiesData.data.title',
      header: 'Title',
      sortable: true,
      style: { minWidth: '10rem' },
    },
    {
      field: 'InfrastructureFacilitiesData.data.smallDescription',
      header: 'Description',
      sortable: true,
      style: { minWidth: '12rem' },
    },
    {
      header: 'From',
      sortable: true,
      sortField: 'InfrastructureFacilitiesData.data.fromDate',
      body: (rowData) => formatDate(rowData?.[DATA_KEY]?.data?.fromDate),
      style: { minWidth: '8rem' },
    },
    {
      header: 'To',
      sortable: true,
      sortField: 'InfrastructureFacilitiesData.data.toDate',
      body: (rowData) => formatDate(rowData?.[DATA_KEY]?.data?.toDate),
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
      header: 'Status',
      body: (rowData) => (
        <InputSwitch
          checked={Number(rowData?.[DATA_KEY]?.data?.status) === 1}
          disabled={updatingStatusId === rowData._id}
          onChange={(event) => handleStatusToggle(rowData, event.value)}
        />
      ),
      align: 'center',
      style: { minWidth: '6rem' },
    },
    {
      header: 'Action',
      body: (rowData) => (
        <div className="flex justify-center items-center gap-4">
          <Link
            href={`/admin/infrastructure-facilities/add?id=${rowData._id}`}
            className="leading-none"
            title="Edit"
          >
            <i className="pi pi-pen-to-square text-[18px]" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setDeleteId(rowData._id);
              setDeleteDialogVisible(true);
            }}
            className="leading-none bg-transparent border-0 cursor-pointer text-red-500 p-0"
            title="Delete"
          >
            <i className="pi pi-trash text-[18px]" />
          </button>
        </div>
      ),
      align: 'center',
      style: { minWidth: '6rem', background: '#fbf7dc' },
    },
  ];

  return (
    <div className="p-5">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        message="Are you sure you want to delete this record?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={() => handleDelete(deleteId)}
        reject={() => setDeleteDialogVisible(false)}
        acceptClassName="p-button-danger"
        rejectClassName="p-button-secondary"
      />

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[#19212A] text-[22px] font-[700]">Infrastructure Facilities</h2>
        <Link
          href="/admin/infrastructure-facilities/add"
          className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center"
        >
          <i className="pi pi-plus text-[14px]" /> Add
        </Link>
      </div>

      <CommonDataTable
        value={rows}
        columns={columns}
        loading={loading}
        totalRecords={totalRecords}
        first={lazyParams.first}
        rows={lazyParams.rows}
        sortField={lazyParams.sortField}
        sortOrder={lazyParams.sortOrder}
        onPage={(e) => {
          setLazyParams((prev) => ({
            ...prev,
            first: e.first,
            rows: e.rows,
            page: e.page + 1,
          }));
        }}
        onSort={(event) => {
          setLazyParams((prev) => ({
            ...prev,
            sortField: event.sortField,
            sortOrder: event.sortOrder,
            first: 0,
            page: 1,
          }));
        }}
        emptyMessage="No records found."
        headerTitle="All Infrastructure Facilities"
        showSearch
        searchPlaceholder="Search here.."
        searchValue={search}
        onSearch={(e) => {
          setSearch(e.target.value);
          setLazyParams((prev) => ({ ...prev, page: 1, first: 0 }));
        }}
        yearFilterValue={yearFilter}
        onYearFilterChange={(value) => {
          setYearFilter(value);
          setLazyParams((prev) => ({ ...prev, page: 1, first: 0 }));
        }}
      />
    </div>
  );
}
