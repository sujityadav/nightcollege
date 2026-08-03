'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Link from 'next/link';
import axios from 'axios';
import { useSelector } from 'react-redux';

const SideBarNavItems = [
  { label: 'Rebranding', href: '/admin/rebranding' },
  { label: 'Contact Information', href: '/admin/rebranding/contact-info' },
  { label: 'Flash Screen Popup', href: '/admin/rebranding/home-popup' },
];

export default function HomePopupList() {
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

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { page, rows, sortField, sortOrder, search } = lazyParams;
      const res = await axios.get('/api/flash-screen', {
        params: { page, limit: rows, search, sortField, sortOrder },
      });
      setData(res.data.data || []);
      setTotalRecords(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching flash screens:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load flash screens',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lazyParams]);

  const handleStatusToggle = async (rowData, checked) => {
    const newStatus = checked ? 1 : 0;
    const previousStatus = Number(rowData?.FlashScreenData?.data?.status ?? 0);

    setData((prev) =>
      prev.map((item) =>
        item._id === rowData._id
          ? {
              ...item,
              FlashScreenData: {
                ...item.FlashScreenData,
                data: {
                  ...item.FlashScreenData?.data,
                  status: newStatus,
                },
              },
            }
          : item
      )
    );
    setUpdatingStatusId(rowData._id);

    try {
      const response = await axios.put(
        `/api/flash-screen/${rowData._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to update status');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Flash screen marked as ${newStatus === 1 ? 'active' : 'inactive'}`,
        life: 2500,
      });
    } catch (err) {
      setData((prev) =>
        prev.map((item) =>
          item._id === rowData._id
            ? {
                ...item,
                FlashScreenData: {
                  ...item.FlashScreenData,
                  data: {
                    ...item.FlashScreenData?.data,
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

  const deleteItem = async (id) => {
    try {
      const response = await axios.delete(`/api/flash-screen/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to delete');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Flash screen deleted successfully',
        life: 2500,
      });
      fetchData();
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete flash screen',
        life: 3000,
      });
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      header: 'Delete Flash Screen',
      message: 'Are you sure you want to delete this flash screen?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => deleteItem(rowData._id),
    });
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const serialNumberTemplate = (_rowData, options) =>
    lazyParams.first + options.rowIndex + 1;

  const photoTemplate = (rowData) => {
    const photo = rowData?.FlashScreenData?.data?.photo;
    if (!photo) return <span className="text-gray-400 text-sm">No Photo</span>;
    return (
      <img
        src={photo}
        alt="Flash screen"
        className="h-14 w-24 rounded object-cover"
      />
    );
  };

  const statusTemplate = (rowData) => (
    <InputSwitch
      checked={Number(rowData?.FlashScreenData?.data?.status) === 1}
      disabled={updatingStatusId === rowData._id}
      onChange={(e) => handleStatusToggle(rowData, e.value)}
    />
  );

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link
        href={`/admin/rebranding/home-popup/add?id=${rowData._id}`}
        className="leading-none"
      >
        <i className="pi pi-pen-to-square text-[18px]"></i>
      </Link>
      <button
        type="button"
        onClick={() => confirmDelete(rowData)}
        className="leading-none bg-transparent border-0 cursor-pointer text-red-500"
      >
        <i className="pi pi-trash text-[18px]"></i>
      </button>
    </div>
  );

  return (
    <div className="flex w-full min-w-0 items-start">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="shrink-0">
        <SubSidebar title="Rebranding" navItems={SideBarNavItems} />
      </div>

      <div className="min-w-0 flex-1 p-5">
        <div className="flex justify-between mb-5">
          <h2 className="text-[#19212A] text-[22px] font-[700]">
            Flash Screen Popup
          </h2>
          <Link
            href="/admin/rebranding/home-popup/add"
            className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center"
          >
            <i className="pi pi-plus text-[14px]"></i> Add
          </Link>
        </div>

        <div className="bg-white border card-shadow min-w-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-[#EAEDF3] flex justify-between items-center">
            <div className="text-[#101828] font-medium">All Flash Screens</div>
            <IconField iconPosition="left" className="app-search-field">
              <InputIcon className="pi pi-search" />
              <InputText
                placeholder="Search here.."
                onChange={(e) =>
                  setLazyParams({
                    ...lazyParams,
                    search: e.target.value,
                    page: 1,
                    first: 0,
                  })
                }
              />
            </IconField>
          </div>

          <div className="min-w-0 overflow-x-auto">
            <DataTable
              value={data}
              className="custTable tableCust"
              scrollable
              showGridlines
              loading={loading}
              paginator
              totalRecords={totalRecords}
              lazy
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
              first={lazyParams.first}
              rows={lazyParams.rows}
              sortField={lazyParams.sortField}
              sortOrder={lazyParams.sortOrder}
              rowsPerPageOptions={[5, 10, 25, 50]}
              currentPageReportTemplate={`Rows ${lazyParams.first + 1} - ${
                lazyParams.first + data.length
              } of ${totalRecords}`}
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
            >
              <Column header="Sr.No." body={serialNumberTemplate} style={{ minWidth: '4rem' }} />
              <Column header="Photo" body={photoTemplate} style={{ minWidth: '7rem' }} />
              <Column
                field="FlashScreenData.data.status"
                header="Status"
                body={statusTemplate}
                style={{ minWidth: '6rem' }}
              />
              <Column
                field="FlashScreenData.data.fromDate"
                header="From Date"
                body={(row) => formatDate(row?.FlashScreenData?.data?.fromDate)}
                sortable
                style={{ minWidth: '8rem' }}
              />
              <Column
                field="FlashScreenData.data.toDate"
                header="To Date"
                body={(row) => formatDate(row?.FlashScreenData?.data?.toDate)}
                sortable
                style={{ minWidth: '8rem' }}
              />
              <Column
                header="Action"
                body={actionTemplate}
                align="center"
                style={{ minWidth: '6rem', background: '#fbf7dc' }}
              />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
