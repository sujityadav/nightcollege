'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CommonDataTable from '@/app/components/common/DataTable';

export default function AnnouncementsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1, search: '' });
  const toast = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/announcements', {
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
        detail: 'Could not load announcements',
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
      const response = await axios.put(`/api/announcements/${rowData._id}`, { status });
      if (!response.data.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Announcement marked ${status ? 'active' : 'inactive'}`,
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

  const deleteAnnouncement = async (id) => {
    try {
      const response = await axios.delete(`/api/announcements/${id}`);
      if (!response.data.success) throw new Error();
      toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Announcement deleted successfully', life: 2500 });
      fetchData();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not delete announcement', life: 3000 });
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      header: 'Delete Announcement',
      message: `Are you sure you want to delete "${rowData.title}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => deleteAnnouncement(rowData._id),
    });
  };

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '-';

  const columns = [
    {
      header: 'Sr.No.',
      body: (_rowData, options) => lazyParams.first + options.rowIndex + 1,
      style: { minWidth: '3rem' },
    },
    { field: 'sortNo', header: 'Sort Number', style: { minWidth: '7rem' } },
    { field: 'title', header: 'Title', style: { minWidth: '10rem' } },
    {
      header: 'Description',
      body: (rowData) => <span>{rowData.description?.replace(/<[^>]*>/g, '').slice(0, 120) || '-'}</span>,
      style: { minWidth: '14rem' },
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
    { header: 'From (Date)', body: (rowData) => formatDate(rowData.fromDate), style: { minWidth: '8rem' } },
    { header: 'To (Date)', body: (rowData) => formatDate(rowData.toDate), style: { minWidth: '8rem' } },
    {
      header: 'Action',
      body: (rowData) => (
        <div className="flex justify-center items-center gap-4">
          <Link href={`/admin/announcements/add?id=${rowData._id}`} className="leading-none" title="Edit">
            <i className="pi pi-pen-to-square text-[18px]" />
          </Link>
          <button type="button" onClick={() => confirmDelete(rowData)} className="leading-none bg-transparent border-0 cursor-pointer text-red-500 p-0" title="Delete">
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
        <h2 className="text-[#19212A] text-[22px] font-[700]">Announcements</h2>
        <Link href="/admin/announcements/add" className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center">
          <i className="pi pi-plus text-[14px]" /> Add
        </Link>
      </div>
      <CommonDataTable
        value={data}
        columns={columns}
        loading={loading}
        totalRecords={totalRecords}
        first={lazyParams.first}
        rows={lazyParams.rows}
        onPage={(event) => setLazyParams((params) => ({ ...params, first: event.first, rows: event.rows, page: event.page + 1 }))}
        headerTitle="All Announcements"
        showSearch
        searchValue={lazyParams.search}
        onSearch={(event) => setLazyParams((params) => ({ ...params, search: event.target.value, first: 0, page: 1 }))}
      />
    </div>
  );
}
