'use client';
import React, { useEffect, useRef, useState } from 'react'
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
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';

export default function EventList() {
  const router = useRouter();
  const [eventsData, setEventsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'createdAt',
    sortOrder: -1,
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef(null);
  // 🔥 Fetch data from API with query params
  const fetchEventList = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/departments", {
        params: {
          page: lazyParams.page,
          limit: lazyParams.rows,
          sortField: lazyParams.sortField,
          sortOrder: lazyParams.sortOrder,
          search: globalFilter,
        },
      });

      if (response?.data?.success) {
        setEventsData(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventList();
  }, [lazyParams, globalFilter]);

  // 🔥 Delete department
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/departments/${id}`);
      if (response?.data?.success) {
        fetchEventList(); // refresh after delete
        toast.current.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Department deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete department',
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this department?',
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

  const actionTemplate = (rowData) => {
    return (
      <div className="flex justify-center items-center gap-4">
        <Link
          href={`/admin/all-departments/add-departments?id=${rowData?._id}`}
          className="leading-none"
        >
          <i className="pi pi-pen-to-square text-[18px] xl:text-[0.938vw]"></i>
        </Link>
        <button
          type="button"
          onClick={() => confirmDelete(rowData?._id)}
          className="leading-none bg-transparent border-0 cursor-pointer text-red-500"
        >
          <i className="pi pi-trash text-[18px] xl:text-[0.938vw]"></i>
        </button>
      </div>
    );
  };

  const formatDate = (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-';

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <div className='flex justify-between mb-5'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0'>Faculty</h2>
          </div>
          <div>
            <Link
              href='/admin/all-departments/add-departments'
              className='text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[8px] xl:py-[10px] 3xl:py-[0.521vw] leading-[100%] rounded-none p-button-raised flex gap-2 items-center'
            >
              <i className='pi pi-plus text-[14px]'></i> Add Faculty
            </Link>
          </div>
        </div>

        <div className='bg-white border card-shadow'>
          <div className='px-[20px] xl:px-[1.042vw] py-[14px] xl:py-[0.729vw] border-b border-[#EAEDF3]'>
            <div className="md:flex items-center gap-2 justify-between">
              <div className='flex items-center gap-4'>
                <div className="text-[#101828] text-[16px] xl:text-[0.833vw] font-medium">
                  All Departments
                </div>
                <div className="bg-[#F6F7F9] px-[12px] xl:px-[0.625vw] py-[4px] xl:py-[0.208vw] text-[#6C768B] text-[12px] xl:text-[0.625vw] rounded-[16px] xl:rounded-[0.833vw] font-medium">
                  {totalRecords} Records
                </div>
              </div>

              <div className="col custSearch">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search"></InputIcon>
                  <InputText
                    placeholder="Search"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                  />
                </IconField>
              </div>
            </div>
          </div>

          <div className='overflow-auto'>
            <DataTable
              value={eventsData}
              lazy
              loading={loading}
              totalRecords={totalRecords}
              onPage={(e) => setLazyParams({ ...lazyParams, ...e, page: e.page + 1 })}
              onSort={(e) => setLazyParams({ ...lazyParams, ...e })}
              first={lazyParams.first}
              rows={lazyParams.rows}
              sortField={lazyParams.sortField}
              sortOrder={lazyParams.sortOrder}
              className="custTable tableCust"
              scrollable
              showGridlines
              responsiveLayout="scroll"
              paginator
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows {first} - {last} of {totalRecords}"
              rowsPerPageOptions={[5, 10, 25, 50]}
            >
              <Column
                field="DepartmentsData.data.title"
                header="Title"
                sortable
                body={(rowData) => (
                  <a
                    href={`/admin/departments?depatmentId=${rowData._id}`}
                    style={{ color: 'blue', textDecoration: 'underline' }}
                  >
                    {rowData.DepartmentsData.data.title}
                  </a>
                )}
              />
              <Column field="DepartmentsData.data.smallDescription" header="Description" />
              <Column header="Created At" body={(rowData) => formatDate(rowData?.createdAt)} />
              <Column
                header="Action"
                body={actionTemplate}
                align="center"
                frozen
                alignFrozen="right"
                style={{
                  minWidth: "4rem",
                  background: "#fbf7dc",
                  zIndex: 1,
                  boxShadow: "-4px 0 6px -1px rgba(0, 0, 0, 0.1)"
                }}
              />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
