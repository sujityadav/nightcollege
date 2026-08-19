'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CommonDataTable from '@/app/components/common/DataTable';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

export default function QuickLinksPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1, search: '' });
  const toast = useRef(null);

  usePageBreadcrumbs({
    pageTitle: 'Quick Links',
    breadcrumbs: [{ label: 'Quick Links', isCurrent: true }],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/quick-links', {
        params: {
          page: lazyParams.page,
          limit: lazyParams.rows,
          search: lazyParams.search,
        },
      });
      setData(response.data.data || []);
      setTotalRecords(response.data.total || 0);
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not load quick links',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [lazyParams.page, lazyParams.rows, lazyParams.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusToggle = async (rowData, status) => {
    const previousStatus = rowData.status;
    setData((items) => items.map((item) => (item._id === rowData._id ? { ...item, status } : item)));
    setUpdatingStatusId(rowData._id);

    try {
      const response = await axios.put(`/api/quick-links/${rowData._id}`, { ...rowData, status });
      if (!response.data.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Quick link marked ${status ? 'active' : 'inactive'}`,
        life: 2500,
      });
    } catch {
      setData((items) =>
        items.map((item) => (item._id === rowData._id ? { ...item, status: previousStatus } : item))
      );
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not update status', life: 3000 });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const deleteQuickLink = async (id) => {
    try {
      const response = await axios.delete(`/api/quick-links/${id}`);
      if (!response.data.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Quick link deleted successfully',
        life: 2500,
      });
      fetchData();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not delete quick link', life: 3000 });
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      header: 'Delete Quick Link',
      message: `Are you sure you want to delete "${rowData.title}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => deleteQuickLink(rowData._id),
    });
  };

  const columns = [
    { field: 'title', header: 'Title', style: { minWidth: '12rem' } },
    { field: 'type', header: 'Type', style: { minWidth: '8rem' } },
    {
      header: 'Slug',
      body: (rowData) => rowData.slug || '-',
      style: { minWidth: '10rem' },
    },
    {
      header: 'Status',
      body: (rowData) => (
        <InputSwitch
          checked={Boolean(rowData.status)}
          disabled={updatingStatusId === rowData._id}
          onChange={(event) => handleStatusToggle(rowData, event.value)}
        />
      ),
      style: { minWidth: '6rem' },
    },
    {
      header: 'Action',
      body: (rowData) => (
        <div className="flex justify-center items-center gap-4">
          <Link href={`/admin/quick-links/add?id=${rowData._id}`} className="leading-none" title="Edit">
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
      style: { minWidth: '6rem', background: '#fbf7dc' },
    },
  ];

  return (
    <div className="min-w-0 flex-1 p-5">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex justify-between mb-5">
        <h2 className="text-[#19212A] text-[22px] font-[700]">Quick Links</h2>
        <Link href="/admin/quick-links/add" className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center">
          <i className="pi pi-plus text-[14px]" /> Add Quick Link
        </Link>
      </div>
      <CommonDataTable
        value={data}
        columns={columns}
        loading={loading}
        totalRecords={totalRecords}
        first={lazyParams.first}
        rows={lazyParams.rows}
        onPage={(event) =>
          setLazyParams((params) => ({ ...params, first: event.first, rows: event.rows, page: event.page + 1 }))
        }
        headerTitle="All Quick Links"
        showSearch
        searchPlaceholder="Search here.."
        searchValue={lazyParams.search}
        onSearch={(event) =>
          setLazyParams((params) => ({ ...params, search: event.target.value, first: 0, page: 1 }))
        }
      />
    </div>
  );
}
