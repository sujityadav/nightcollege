'use client';
import React, { useEffect, useRef, useState } from 'react'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from 'primereact/tag';
import axios from 'axios';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

export default function EventList() {
  const router = useRouter();
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 0,
    sortField: null,
    sortOrder: null,
    search: ''
  });

  const toast = useRef(null);

  useEffect(() => {
    fetchEventList();
  }, [lazyParams]);

  const fetchEventList = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/stafs", {
        params: {
          page: lazyParams.page + 1,   // backend 1-based page
          limit: lazyParams.rows,
          sortField: lazyParams.sortField,
          sortOrder: lazyParams.sortOrder,
          search: lazyParams.search
        }
      });

      if (response?.data?.success) {
        setEventsData(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/stafs/${id}`);
      if (response?.data?.success) {
        fetchEventList(); // reload data
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Staff deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete staff',
        life: 3000,
      });
    }
  };

  const confirmDelete = (rowData) => {
    const name = rowData?.StaffData?.data?.name || 'this staff member';
    confirmDialog({
      header: 'Delete Staff',
      message: `Are you sure you want to delete "${name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(rowData._id),
    });
  };

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4 ">
      <Link href={`/admin/all-staff/add-staff?id=${rowData._id}`} className="leading-none" >
        <i className="pi pi-pen-to-square text-[18px]"></i>
      </Link>
      <button
        type="button"
        onClick={() => confirmDelete(rowData)}
        className="leading-none bg-transparent border-0 cursor-pointer text-red-500 p-0"
        title="Delete"
      >
        <i className="pi pi-trash text-[18px]"></i>
      </button>
    </div>
  );

  const formatDate = (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-';

  const photoTemplate = (rowData) => {
    const photoUrl = rowData?.StaffData?.data?.photo;
    if (!photoUrl) {
      return <span className="text-gray-400 text-sm">No Photo</span>;
    }
    return (
      <img
        src={photoUrl}
        alt={rowData?.StaffData?.data?.name || 'Staff photo'}
        className="h-14 w-14 rounded-full object-cover"
      />
    );
  };

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className='p-5 w-full'>
        <div className='flex justify-between mb-5'>
          <h2 className='text-[#19212A] text-[22px] font-bold'>All Staff</h2>
          <Link href='/admin/all-staff/add-staff' className='text-white bg-primarycolor px-4 py-2 rounded flex gap-2 items-center'>
            <i className='pi pi-plus text-sm'></i> Add Staff
          </Link>
        </div>

        <div className='bg-white border card-shadow '>
          <div className='px-5 py-3 border-b border-[#EAEDF3] flex justify-between items-center'>
            <div className="text-[#101828] font-medium">All Staff</div>
            <div className="col custSearch">
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                  placeholder="Search"
                  value={lazyParams.search}
                  onChange={(e) =>
                    setLazyParams((prev) => ({
                      ...prev,
                      search: e.target.value,
                      page: 0, // reset to first page
                      first: 0,
                    }))
                  }
                />
              </IconField>
            </div>
          </div>

          <div className='overflow-auto'>
            <DataTable
              value={eventsData}
              className="custTable"
              scrollable
              showGridlines
              responsiveLayout="scroll"
              style={{ width: "100%" }}
              lazy
              paginator
              first={lazyParams.first}
              rows={lazyParams.rows}
              totalRecords={totalRecords}
              loading={loading}
              onPage={(e) => setLazyParams((prev) => ({ ...prev, ...e }))}
              onSort={(e) => setLazyParams((prev) => ({ ...prev, ...e }))}
            >
              <Column header="Photo" body={photoTemplate} style={{ minWidth: '5rem' }} />
              <Column field="StaffData.data.name" header="Name" sortable />
              <Column field="StaffData.data.designation" header="Designation" sortable />
              <Column
                field="StaffData.data.staffType"
                header="Type"
                sortable
                body={(rowData) => rowData?.StaffData?.data?.staffType || '-'}
              />
              <Column header="Created At" body={(rowData) => formatDate(rowData?.createdAt)} sortable />
              <Column
                header="Action"
                body={actionTemplate}
                style={{ minWidth: "4rem", background: "#fbf7dc" }}
                frozen
                alignFrozen="right"
                align="center"
              />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
