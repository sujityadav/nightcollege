'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CommonDataTable from '@/app/components/common/DataTable';

const rowId = (row) => String(row?._id ?? '');

function getThumbnailUrl(row) {
  const images = Array.isArray(row?.images) ? row.images : [];
  const thumb = images.find((item) => item.isThumbnail);
  return thumb?.url || images[0]?.url || '';
}

function GalleryStatusSwitch({ rowData, onToggle }) {
  return (
    <InputSwitch
      checked={rowData.status !== false}
      onChange={(event) => onToggle(rowData, event.value)}
    />
  );
}

export default function GalleryAdminPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [params, setParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    search: '',
    sortField: 'sortOrder',
    sortOrder: 1,
  });
  const toast = useRef(null);
  const statusUpdateInFlight = useRef(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/gallery', {
        params: {
          page: params.page,
          limit: params.rows,
          search: params.search,
          sortField: params.sortField,
          sortOrder: params.sortOrder,
        },
      });
      setData(response.data?.data || []);
      setTotalRecords(response.data?.totalRecords || 0);
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not load galleries',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [params.page, params.rows, params.search, params.sortField, params.sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusToggle = useCallback(async (rowData, status) => {
    const id = rowId(rowData);
    if (!id || statusUpdateInFlight.current.has(id)) return;

    const previousStatus = rowData.status;
    statusUpdateInFlight.current.add(id);
    setData((items) =>
      items.map((item) => (rowId(item) === id ? { ...item, status } : item))
    );

    try {
      const response = await axios.put(`/api/gallery/${id}`, { status });
      if (!response.data?.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Gallery marked ${status ? 'active' : 'inactive'}`,
        life: 2500,
      });
    } catch {
      setData((items) =>
        items.map((item) => (rowId(item) === id ? { ...item, status: previousStatus } : item))
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not update status',
        life: 3000,
      });
    } finally {
      statusUpdateInFlight.current.delete(id);
    }
  }, []);

  const deleteGallery = async (id) => {
    try {
      const response = await axios.delete(`/api/gallery/${id}`);
      if (!response.data?.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Gallery deleted successfully',
        life: 2500,
      });
      fetchData();
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not delete gallery',
        life: 3000,
      });
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      header: 'Delete Gallery',
      message: `Are you sure you want to delete "${rowData.title}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => deleteGallery(rowData._id),
    });
  };

  const columns = [
    {
      header: 'Image',
      body: (rowData) => {
        const url = getThumbnailUrl(rowData);
        return url ? (
          <img src={url} alt={rowData.title} className="h-14 w-24 rounded object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        );
      },
      style: { minWidth: '8rem' },
    },
    { field: 'title', header: 'Title', sortable: true, style: { minWidth: '12rem' } },
    {
      field: 'sortOrder',
      header: 'Sort Order',
      sortable: true,
      align: 'center',
      style: { minWidth: '8rem' },
    },
    {
      field: 'description',
      header: 'Description',
      sortable: true,
      body: (rowData) => (
        <span>{rowData.description?.slice(0, 120) || '-'}</span>
      ),
      style: { minWidth: '14rem' },
    },
    {
      header: 'Status',
      body: (rowData) => (
        <GalleryStatusSwitch rowData={rowData} onToggle={handleStatusToggle} />
      ),
      style: { minWidth: '6rem' },
    },
    {
      header: 'Action',
      align: 'center',
      style: { minWidth: '6rem', background: '#fbf7dc' },
      body: (rowData) => (
        <div className="flex justify-center items-center gap-4">
          <Link
            href={`/admin/gallery/add?id=${rowData._id}`}
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
    },
  ];

  return (
    <div className="w-full p-[20px] xl:p-[25px]">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex justify-between mb-5">
        <h2 className="text-[#19212A] text-[22px] font-[700] m-0">Gallery</h2>
        <Link
          href="/admin/gallery/add"
          className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center"
        >
          <i className="pi pi-plus text-[14px]" /> Add Gallery
        </Link>
      </div>
      <CommonDataTable
        value={data}
        columns={columns}
        loading={loading}
        totalRecords={totalRecords}
        first={params.first}
        rows={params.rows}
        sortField={params.sortField}
        sortOrder={params.sortOrder}
        onPage={(event) =>
          setParams((current) => ({
            ...current,
            first: event.first,
            rows: event.rows,
            page: event.page + 1,
          }))
        }
        onSort={(event) =>
          setParams((current) => ({
            ...current,
            sortField: event.sortField,
            sortOrder: event.sortOrder,
            first: 0,
            page: 1,
          }))
        }
        headerTitle="All Galleries"
        showSearch
        searchValue={params.search}
        onSearch={(event) =>
          setParams((current) => ({
            ...current,
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
