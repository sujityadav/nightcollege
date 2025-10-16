'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { InputText } from 'primereact/inputtext';
import Link from 'next/link';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from 'axios';
import { format } from 'date-fns';
import { Toast } from 'primereact/toast';
import Image from 'next/image';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';

export default function AlumniList() {
  const [alumniData, setAlumniData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'createdAt',
    sortOrder: -1,
    search: ''
  });

  const toast = useRef(null);

  useEffect(() => {
    fetchAlumniList();
  }, [lazyParams]);

  const fetchAlumniList = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/alumni", {
        params: {
          page: lazyParams.page,
          limit: lazyParams.rows,
          sortField: lazyParams.sortField,
          sortOrder: lazyParams.sortOrder,
          search: lazyParams.search
        }
      });

      if (response?.data?.success) {
        setAlumniData(response?.data?.data);
        setTotalRecords(response?.data?.totalRecords);
      }
    } catch (err) {
      console.error("Failed to fetch alumni:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/alumni/${id}`);
      if (response?.data?.success) {
        fetchAlumniList();
        toast.current.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Alumni deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete alumni:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete alumni',
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this alumni record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(id),
      reject: () => {
        toast.current.show({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Delete cancelled',
          life: 2000,
        });
      },
    });
  };

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link href={`/admin/alumni/add-alumni?id=${rowData?._id}`} className="leading-none">
        <i className="pi pi-pen-to-square text-[18px]"></i>
      </Link>
      <button
        type="button"
        onClick={() => confirmDelete(rowData?._id)}
        className="leading-none bg-transparent border-0 cursor-pointer text-red-500"
      >
        <i className="pi pi-trash text-[18px]"></i>
      </button>
    </div>
  );

  const photoTemplate = (rowData) => {
    return rowData?.AlumniData?.data?.profilePhoto ? (
      <Image
        src={rowData.AlumniData.data.profilePhoto}
        alt="Alumni"
        width={40}
        height={40}
        className="rounded-full"
      />
    ) : (
      <span className="text-gray-400">No Photo</span>
    );
  };

  const formatDate = (value) => (value ? format(new Date(value), 'dd MMM yyyy') : '-');

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className='p-[20px] xl:p-[25px] w-full'>
        <div className='flex justify-between mb-5'>
          <h2 className='text-[#19212A] text-[14px] xl:text-[22px] font-[700] m-0'>Alumni</h2>
          <Link href='/admin/alumni/add-alumni' className='text-white border bg-primarycolor px-4 py-2 flex gap-2 items-center'>
            <i className='pi pi-plus text-[14px]'></i> Add Alumni
          </Link>
        </div>

        <div className='bg-white border card-shadow'>
          <div className='px-[20px] py-[14px] border-b border-[#EAEDF3] flex justify-between'>
            <div className="flex items-center gap-4">
              <span className="text-[#101828] text-[16px] font-medium">All Alumni</span>
              <span className="bg-[#F6F7F9] px-3 py-1 text-[#6C768B] text-[12px] rounded-full font-medium">
                {totalRecords} Records
              </span>
            </div>

            <IconField iconPosition="left">
              <InputIcon className="pi pi-search"></InputIcon>
              <InputText
                placeholder="Search"
                value={lazyParams.search}
                onChange={(e) =>
                  setLazyParams({ ...lazyParams, page: 1, first: 0, search: e.target.value })
                }
              />
            </IconField>
          </div>

          <div className='overflow-auto'>
            <DataTable
              value={alumniData}
              lazy
              loading={loading}
              paginator
              totalRecords={totalRecords}
              first={lazyParams.first}
              rows={lazyParams.rows}
              onPage={(e) => setLazyParams({ ...lazyParams, ...e, page: e.page + 1 })}
              onSort={(e) => setLazyParams({ ...lazyParams, sortField: e.sortField, sortOrder: e.sortOrder })}
              sortField={lazyParams.sortField}
              sortOrder={lazyParams.sortOrder}
              className="custTable tableCust"
              scrollable
              showGridlines
              responsiveLayout="scroll"
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows {first} - {last} of {totalRecords}"
              rowsPerPageOptions={[5, 10, 25, 50]}
            >
              <Column header="Photo" body={photoTemplate} style={{ minWidth: '6rem' }} />
              <Column field="AlumniData.data.fullName" header="Name" sortable />
              <Column
                header="Batch Year"
                body={(rowData) =>
                  rowData?.AlumniData?.data?.batchYear
                    ? new Date(rowData.AlumniData.data.batchYear).getFullYear()
                    : '-'
                }
              />
              <Column field="AlumniData.data.course" header="Course" sortable />
              <Column field="AlumniData.data.position" header="Position" />
              <Column field="AlumniData.data.company" header="Company" />
              <Column header="Action" body={actionTemplate} align="center"
                style={{ minWidth: "5rem", background: "#fbf7dc", boxShadow: "-4px 0 6px -1px rgba(0, 0, 0, 0.1)" }}
              />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
