'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CommonDataTable from '@/app/components/common/DataTable';

const rowId = (rowData) => String(rowData?._id ?? '');

function StatusSwitch({ rowData, onToggle }) {
  return (
    <InputSwitch
      checked={Boolean(rowData.status)}
      onChange={(event) => onToggle(rowData, event.value)}
    />
  );
}

export default function AqarDocumentsPanel() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    search: '',
    sortField: null,
    sortOrder: null,
  });
  const toast = useRef(null);
  const statusUpdateInFlight = useRef(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/naac-aqar-documents', {
        params: {
          page: lazyParams.page,
          limit: lazyParams.rows,
          search: lazyParams.search,
          sortField: lazyParams.sortField,
          sortOrder: lazyParams.sortOrder,
        },
      });
      setData(response.data.data || []);
      setTotalRecords(response.data.total || 0);
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not load AQAR documents',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [
    lazyParams.page,
    lazyParams.rows,
    lazyParams.search,
    lazyParams.sortField,
    lazyParams.sortOrder,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusToggle = useCallback(async (rowData, status) => {
    const id = rowId(rowData);
    if (!id || statusUpdateInFlight.current.has(id)) return;

    const previousStatus = rowData.status;
    statusUpdateInFlight.current.add(id);
    setData((items) => items.map((item) => (rowId(item) === id ? { ...item, status } : item)));

    try {
      const response = await axios.put(`/api/naac-aqar-documents/${id}`, { status });
      if (!response.data.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Marked ${status ? 'active' : 'inactive'}`,
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

  const deleteItem = async (id) => {
    try {
      const response = await axios.delete(`/api/naac-aqar-documents/${id}`);
      if (!response.data.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'AQAR document deleted',
        life: 2500,
      });
      fetchData();
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not delete',
        life: 3000,
      });
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      header: 'Delete AQAR Document',
      message: `Delete "${rowData.title}" and all its parts and index data?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => deleteItem(rowData._id),
    });
  };

  const columns = [
    {
      field: 'sortOrder',
      header: 'Sort Order',
      sortable: true,
      align: 'center',
      headerStyle: { textAlign: 'center' },
      body: (rowData) => rowData.sortOrder ?? 0,
      style: { minWidth: '4.5rem', width: '4.5rem', maxWidth: '4.5rem' },
    },
    {
      field: 'title',
      header: 'Title',
      sortable: true,
      body: (rowData) => (
        <Link
          href={`/admin/naac/aqar-documents/${rowData._id}`}
          className="text-primarycolor hover:underline"
        >
          {rowData.title}
        </Link>
      ),
      style: { minWidth: '16rem' },
    },
    {
      header: 'Status',
      align: 'center',
      headerStyle: { textAlign: 'center' },
      body: (rowData) => (
        <div className="flex justify-center">
          <StatusSwitch rowData={rowData} onToggle={handleStatusToggle} />
        </div>
      ),
      style: { minWidth: '6rem', width: '6rem' },
    },
    {
      header: 'Action',
      body: (rowData) => (
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/admin/naac/aqar-documents/add?id=${rowData._id}`}
            className="leading-none"
            title="Edit"
          >
            <i className="pi pi-pen-to-square text-[18px]" />
          </Link>
          <button
            type="button"
            onClick={() => confirmDelete(rowData)}
            className="cursor-pointer border-0 bg-transparent p-0 leading-none text-red-500"
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
    <div className="min-w-0 flex-1">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="mb-5 flex justify-between">
        <h2 className="m-0 text-[22px] font-[700] text-[#19212A]">AQAR - Documents Link</h2>
        <Link
          href="/admin/naac/aqar-documents/add"
          className="flex items-center gap-2 bg-primarycolor px-4 py-2 text-white"
        >
          <i className="pi pi-plus text-[14px]" /> Add AQAR Document
        </Link>
      </div>
      <CommonDataTable
        value={data}
        columns={columns}
        loading={loading}
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
        headerTitle="All AQAR Documents"
        showSearch
        searchPlaceholder="Search by title.."
        searchValue={lazyParams.search}
        onSearch={(event) =>
          setLazyParams((params) => ({ ...params, search: event.target.value, first: 0, page: 1 }))
        }
        dataTableProps={{ dataKey: '_id' }}
      />
    </div>
  );
}
