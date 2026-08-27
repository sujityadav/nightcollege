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
import { getFirstPhotoUrl } from '@/app/components/common/MediaUpload';

export default function EventList() {
  usePageBreadcrumbs({
    pageTitle: 'Events Management',
    pathLabels: {
      '/admin': 'Dashboard',
      '/admin/events': 'Events',
    },
  });

  const [eventsData, setEventsData] = useState([]);
  const [search, setSearch] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
  });
  const toast = useRef(null);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchEventList = async () => {
    try {
      const response = await axios.get('/api/events', {
        params: {
          search,
          page: lazyParams.page,
          limit: lazyParams.rows,
        },
      });
      if (response?.data?.success) {
        setEventsData(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch events',
      });
    }
  };

  useEffect(() => {
    fetchEventList();
  }, [lazyParams, search]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  const formatCategories = (value) => {
    if (!value) return '-';
    if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '-';
    return String(value);
  };

  const imageTemplate = (rowData) => {
    const imageUrl = getFirstPhotoUrl(rowData?.Eventdata?.data);

    if (!imageUrl) {
      return <span className="text-gray-400 text-sm">No Image</span>;
    }

    return (
      <img
        src={imageUrl}
        alt={rowData?.Eventdata?.data?.title || 'Event'}
        className="h-14 w-24 rounded object-cover"
      />
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/events/${id}`);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Event deleted successfully',
      });
      fetchEventList();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete event',
      });
    }
    setDeleteDialogVisible(false);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogVisible(true);
  };

  const handleStatusToggle = async (rowData, checked) => {
    const newStatus = checked ? 1 : 0;
    const previousStatus = Number(rowData?.Eventdata?.data?.status ?? 0);

    setEventsData((prev) =>
      prev.map((item) =>
        item._id === rowData._id
          ? {
              ...item,
              Eventdata: {
                ...item.Eventdata,
                data: {
                  ...item.Eventdata?.data,
                  status: newStatus,
                },
              },
            }
          : item
      )
    );
    setUpdatingStatusId(rowData._id);

    try {
      const response = await axios.put(`/api/events/${rowData._id}`, {
        data: {
          ...rowData.Eventdata?.data,
          status: newStatus,
        },
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to update status');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Event marked as ${newStatus === 1 ? 'active' : 'inactive'}`,
        life: 2500,
      });
    } catch (error) {
      setEventsData((prev) =>
        prev.map((item) =>
          item._id === rowData._id
            ? {
                ...item,
                Eventdata: {
                  ...item.Eventdata,
                  data: {
                    ...item.Eventdata?.data,
                    status: previousStatus,
                  },
                },
              }
            : item
        )
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update status',
        life: 3000,
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Match rebranding action icons (edit + delete)
  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link
        href={`/admin/events/add-events?id=${rowData._id}`}
        className="leading-none"
        title="Edit"
      >
        <i className="pi pi-pen-to-square text-[18px]" />
      </Link>
      <button
        type="button"
        onClick={() => confirmDelete(rowData._id)}
        className="leading-none bg-transparent border-0 cursor-pointer text-red-500 p-0"
        title="Delete"
      >
        <i className="pi pi-trash text-[18px]" />
      </button>
    </div>
  );

  const columns = [
    {
      header: 'Image',
      body: imageTemplate,
      style: { minWidth: '7rem' },
    },
    {
      field: 'Eventdata.data.title',
      header: 'Title',
      sortable: true,
      style: { minWidth: '10rem' },
    },
    {
      field: 'Eventdata.data.smallDescription',
      header: 'Description',
      style: { minWidth: '12rem' },
    },
    {
      header: 'Category',
      body: (rowData) => formatCategories(rowData?.Eventdata?.data?.category),
      style: { minWidth: '10rem' },
    },
    {
      field: 'Eventdata.data.location',
      header: 'Location',
      style: { minWidth: '8rem' },
    },
    {
      header: 'From',
      body: (rowData) => formatDate(rowData?.Eventdata?.data?.fromDate),
      style: { minWidth: '8rem' },
    },
    {
      header: 'To',
      body: (rowData) => formatDate(rowData?.Eventdata?.data?.toDate),
      style: { minWidth: '8rem' },
    },
    {
      header: 'Created At',
      body: (rowData) => formatDate(rowData?.createdAt),
      style: { minWidth: '8rem' },
    },
    {
      header: 'Status',
      body: (rowData) => (
        <InputSwitch
          checked={Number(rowData?.Eventdata?.data?.status) === 1}
          disabled={updatingStatusId === rowData._id}
          onChange={(event) => handleStatusToggle(rowData, event.value)}
        />
      ),
      align: 'center',
      style: { minWidth: '6rem' },
    },
    {
      header: 'Action',
      body: actionTemplate,
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
        message="Are you sure you want to delete this event?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={() => handleDelete(deleteId)}
        reject={() => setDeleteDialogVisible(false)}
        acceptClassName="p-button-danger"
        rejectClassName="p-button-secondary"
      />

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[#19212A] text-[22px] font-[700]">Events</h2>
        <Link
          href="/admin/events/add-events"
          className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center"
        >
          <i className="pi pi-plus text-[14px]" /> Add Event
        </Link>
      </div>

      <CommonDataTable
        value={eventsData}
        columns={columns}
        totalRecords={totalRecords}
        first={lazyParams.first}
        rows={lazyParams.rows}
        onPage={(e) => {
          setLazyParams({
            first: e.first,
            rows: e.rows,
            page: e.page + 1,
          });
        }}
        emptyMessage="No events found."
        headerTitle="All Events"
        showSearch
        searchPlaceholder="Search here.."
        searchValue={search}
        onSearch={(e) => {
          setSearch(e.target.value);
          setLazyParams((prev) => ({ ...prev, page: 1, first: 0 }));
        }}
      />
    </div>
  );
}
