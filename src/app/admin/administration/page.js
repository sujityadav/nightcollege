'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { Toast } from 'primereact/toast';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import CommonDataTable from '@/app/components/common/DataTable';

const actionColumnStyle = {
  minWidth: '4rem',
  background: '#fbf7dc',
  zIndex: 1,
  boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1)',
};

export default function AdministrationList() {
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tableParams, setTableParams] = useState({ first: 0, rows: 10 });
  const [sortMeta, setSortMeta] = useState({
    sortField: 'AdministrationData.data.sortOrder',
    sortOrder: 1,
  });
  const toast = useRef(null);

  const fetchEventList = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/administration');
      if (response?.data?.success) {
        setEventsData(response?.data?.data || []);
      }
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch administration list',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventList();
  }, []);

  const filteredData = useMemo(() => {
    if (!search.trim()) return eventsData;
    const query = search.toLowerCase();
    return eventsData.filter((item) => {
      const title = item?.AdministrationData?.data?.title?.toLowerCase() || '';
      const description = item?.AdministrationData?.data?.smallDescription?.toLowerCase() || '';
      const sortOrder = String(item?.AdministrationData?.data?.sortOrder ?? '');
      return title.includes(query) || description.includes(query) || sortOrder.includes(query);
    });
  }, [eventsData, search]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/administration/${id}`);
      if (response?.data?.success) {
        setEventsData((current) => current.filter((item) => item._id !== id));
        toast.current?.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Administration deleted successfully',
          life: 3000,
        });
      }
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete administration',
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this administration?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(id),
    });
  };

  const formatDate = (value) => (value ? format(new Date(value), 'dd MMM yyyy') : '-');

  const columns = [
    {
      header: 'Title',
      sortable: true,
      sortField: 'AdministrationData.data.title',
      body: (rowData) => (
        <Link
          href={`/admin/sub-administration?administrationId=${rowData._id}`}
          className="text-primarycolor underline"
        >
          {rowData.AdministrationData?.data?.title || '-'}
        </Link>
      ),
      style: { minWidth: '12rem' },
    },
    {
      header: 'Sort Order',
      sortable: true,
      sortField: 'AdministrationData.data.sortOrder',
      body: (rowData) => rowData?.AdministrationData?.data?.sortOrder ?? '-',
      align: 'center',
      style: { minWidth: '5rem' },
    },
    {
      field: 'AdministrationData.data.smallDescription',
      header: 'Description',
      sortable: true,
      sortField: 'AdministrationData.data.smallDescription',
      style: { minWidth: '10rem' },
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
            href={`/admin/administration/add-administration?id=${rowData?._id}`}
            className="leading-none"
            title="Edit"
          >
            <i className="pi pi-pen-to-square text-[18px]" />
          </Link>
          <button
            type="button"
            onClick={() => confirmDelete(rowData?._id)}
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
        <h2 className="text-[#19212A] text-[22px] font-[700] m-0">Administration</h2>
        <Link
          href="/admin/administration/add-administration"
          className="text-white border bg-primarycolor border-[#af251c] px-[14px] py-[8px] flex gap-2 items-center"
        >
          <i className="pi pi-plus text-[14px]" /> Add Administration
        </Link>
      </div>

      <CommonDataTable
        value={filteredData}
        columns={columns}
        loading={loading}
        lazy={false}
        totalRecords={filteredData.length}
        headerTitle="All Administration"
        showSearch
        searchPlaceholder="Search here.."
        searchValue={search}
        onSearch={(event) => {
          setSearch(event.target.value);
          setTableParams((params) => ({ ...params, first: 0 }));
        }}
        first={tableParams.first}
        rows={tableParams.rows}
        sortField={sortMeta.sortField}
        sortOrder={sortMeta.sortOrder}
        onSort={(event) => {
          setSortMeta({
            sortField: event.sortField,
            sortOrder: event.sortOrder,
          });
          setTableParams((params) => ({ ...params, first: 0 }));
        }}
        onPage={(event) =>
          setTableParams({
            first: event.first,
            rows: event.rows,
          })
        }
        dataTableProps={{ dataKey: '_id' }}
      />
    </div>
  );
}
