'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CommonDataTable from '@/app/components/common/DataTable';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

function YearStatusSwitch({ rowData, disabled, onToggle }) {
  return (
    <InputSwitch
      checked={Boolean(rowData.status)}
      disabled={disabled}
      onChange={(event) => onToggle(rowData, event.value)}
    />
  );
}

export default function MasterYearsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    search: '',
  });
  const toast = useRef(null);

  usePageBreadcrumbs({
    pageTitle: 'Years',
    breadcrumbs: [
      { label: 'Settings', href: '/admin/settings' },
      { label: 'Masters', href: '/admin/settings/masters' },
      { label: 'Years', isCurrent: true },
    ],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { page, rows, sortField, sortOrder, search } = lazyParams;
      const response = await axios.get('/api/master-years', {
        params: {
          page,
          limit: rows,
          search,
          sortField,
          sortOrder,
        },
      });
      setData(response.data.data || []);
      setTotalRecords(response.data.total || 0);
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not load years',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [lazyParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusToggle = async (rowData, status) => {
    const previousStatus = rowData.status;
    setData((items) =>
      items.map((item) => (item._id === rowData._id ? { ...item, status } : item))
    );
    setUpdatingStatusId(rowData._id);

    try {
      const response = await axios.put(`/api/master-years/${rowData._id}`, { status });
      if (!response.data.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Year marked ${status ? 'active' : 'inactive'}`,
        life: 2500,
      });
    } catch {
      setData((items) =>
        items.map((item) =>
          item._id === rowData._id ? { ...item, status: previousStatus } : item
        )
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not update status',
        life: 3000,
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const deleteYear = async (id) => {
    try {
      const response = await axios.delete(`/api/master-years/${id}`);
      if (!response.data.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Year deleted successfully',
        life: 2500,
      });
      fetchData();
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not delete year',
        life: 3000,
      });
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      header: 'Delete Year',
      message: `Are you sure you want to delete ${rowData.fromYear} – ${rowData.toYear}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => deleteYear(rowData._id),
    });
  };

  const serialNumberTemplate = (_rowData, options) => lazyParams.first + options.rowIndex + 1;

  const columns = [
    { header: 'Sr.', body: serialNumberTemplate, style: { minWidth: '3rem' } },
    { field: 'fromYear', header: 'From Year', sortable: true, style: { minWidth: '8rem' } },
    { field: 'toYear', header: 'To Year', sortable: true, style: { minWidth: '8rem' } },
    {
      header: 'Status',
      body: (rowData) => (
        <YearStatusSwitch
          rowData={rowData}
          disabled={updatingStatusId === rowData._id}
          onToggle={handleStatusToggle}
        />
      ),
      style: { minWidth: '6rem' },
    },
    {
      header: 'Action',
      body: (rowData) => (
        <div className="flex justify-center items-center gap-4">
          <Link
            href={`/admin/settings/masters/years/add?id=${rowData._id}`}
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
      style: { minWidth: '6rem', background: '#fbf7dc' },
    },
  ];

  return (
    <div className="min-w-0 flex-1 p-5">
      <Toast ref={toast} />
      <ConfirmDialog />
        <div className="flex justify-between mb-5">
          <h2 className="text-[#19212A] text-[22px] font-[700]">Years</h2>
          <Link
            href="/admin/settings/masters/years/add"
            className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center"
          >
            <i className="pi pi-plus text-[14px]" /> Add Year
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
            setLazyParams({
              ...lazyParams,
              first: event.first,
              rows: event.rows,
              page: event.page + 1,
            })
          }
          onSort={(event) =>
            setLazyParams({
              ...lazyParams,
              sortField: event.sortField,
              sortOrder: event.sortOrder,
            })
          }
          headerTitle="All Years"
          showSearch
          searchPlaceholder="Search here.."
          searchValue={lazyParams.search}
          onSearch={(event) =>
            setLazyParams({ ...lazyParams, search: event.target.value, first: 0, page: 1 })
          }
          dataTableProps={{ dataKey: '_id' }}
        />
    </div>
  );
}
