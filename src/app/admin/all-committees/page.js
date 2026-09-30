'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

export default function CommitteesList() {
  const [eventsData, setEventsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    search: '',
    sortField: 'CommitiesData.data.sortOrder',
    sortOrder: 1,
  });
  const toast = useRef(null);

  const fetchEventList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/commities', {
        params: {
          page: lazyParams.page,
          limit: lazyParams.rows,
          sortField: lazyParams.sortField,
          sortOrder: lazyParams.sortOrder,
          search: lazyParams.search,
        },
      });

      if (response?.data?.success) {
        setEventsData(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch committees',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [lazyParams]);

  useEffect(() => {
    fetchEventList();
  }, [fetchEventList]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/commities/${id}`);
      if (response?.data?.success) {
        fetchEventList();
        toast.current?.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Committee deleted successfully',
          life: 3000,
        });
      }
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete committee',
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this committee?',
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
      sortField: 'CommitiesData.data.title',
      body: (rowData) => {
        const title = rowData?.CommitiesData?.data?.title || '-';
        const hasActivities = rowData?.CommitiesData?.data?.hasActivities;

        return hasActivities ? (
          <Link
            href={`/admin/all-committees/view-committee?id=${rowData._id}`}
            className="text-primarycolor underline"
          >
            {title}
          </Link>
        ) : (
          <span>{title}</span>
        );
      },
      style: { minWidth: '12rem' },
    },
    {
      header: 'Sort Order',
      sortable: true,
      sortField: 'CommitiesData.data.sortOrder',
      body: (rowData) => rowData?.CommitiesData?.data?.sortOrder ?? '-',
      align: 'center',
      style: { minWidth: '5rem' },
    },
    {
      field: 'CommitiesData.data.smallDescription',
      header: 'Description',
      sortable: true,
      sortField: 'CommitiesData.data.smallDescription',
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
          <Link href={`/admin/all-committees/add-committee?id=${rowData?._id}`} className="leading-none" title="Edit">
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
        <h2 className="text-[#19212A] text-[22px] font-[700] m-0">Committees</h2>
        <Link
          href="/admin/all-committees/add-committee"
          className="text-white border bg-primarycolor border-[#af251c] px-[14px] py-[8px] flex gap-2 items-center"
        >
          <i className="pi pi-plus text-[14px]" /> Add Committee
        </Link>
      </div>

      <CommonDataTable
        value={eventsData}
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
        headerTitle="All Committees"
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
