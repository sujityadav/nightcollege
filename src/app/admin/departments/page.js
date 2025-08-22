'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from 'axios';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toast } from 'primereact/toast';

export default function InnerDepartmentList() {
  const router = useRouter();
  const [departmentsData, setDepartmentsData] = useState([]);
  const toast = useRef(null);
  const searchParams = useSearchParams();
  const depatmentId = searchParams.get('depatmentId');

  useEffect(() => {
    const fetchDepartmentsList = async () => {
      try {
        const response = await axios.get(`/api/innerdepartments`, {
          params: { departmentId: depatmentId },
        });
        if (response?.data?.success) {
          setDepartmentsData(response?.data?.data);
        }
      } catch (err) {
        console.error("Failed to fetch inner departments:", err);
      }
    };
    fetchDepartmentsList();
  }, [depatmentId]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/innerDepartments/${id}`);
      if (response?.data?.success) {
        setDepartmentsData(departmentsData.filter(item => item._id !== id));
        toast.current.show({
          severity: 'success',
          summary: 'Success',
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

  const actionTemplate = (rowData) => {
    return (
      <div className="flex justify-center items-center gap-4">
        <Link
          href={`/admin/departments/create-departments?id=${rowData?._id}&depatmentId=${depatmentId}`}
          className="leading-none"
        >
          <i className="pi pi-pen-to-square text-[18px]"></i>
        </Link>
        <button onClick={() => handleDelete(rowData?._id)} className="leading-none">
          <i className="pi pi-trash text-[18px]"></i>
        </button>
      </div>
    );
  };

  const formatDate = (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-';

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <div className='p-[20px] xl:p-[25px] w-full'>
        <div className='flex justify-between mb-5'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] font-[700] m-0'>Departments</h2>
          </div>
          <div>
            <Link
              href={`/admin/departments/create-departments?depatmentId=${depatmentId}`}
              className='text-white border bg-primarycolor border-[#af251c] px-4 py-2 flex gap-2 items-center'
            >
              <i className='pi pi-plus text-[14px]'></i> Add Department
            </Link>
          </div>
        </div>

        <div className='bg-white border card-shadow'>
          <div className='px-[20px] py-[14px] border-b border-[#EAEDF3]'>
            <div className="md:flex items-center gap-2 justify-between">
              <div className='flex items-center gap-4'>
                <div className="text-[#101828] text-[16px] font-medium">
                  All Departments
                </div>
                <div className="bg-[#F6F7F9] px-3 py-1 text-[#6C768B] text-[12px] rounded-full font-medium">
                  {departmentsData.length} Records
                </div>
              </div>

              <div className="col custSearch">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search"></InputIcon>
                  <InputText placeholder="Search" />
                </IconField>
              </div>
            </div>
          </div>

          <div className='overflow-auto'>
            <DataTable
              value={departmentsData}
              className="custTable tableCust"
              scrollable
              showGridlines
              responsiveLayout="scroll"
              paginator
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows {first} - {last} of {totalRecords}"
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            >
              <Column
                field="InnerDepartmentsData.data.title"
                header="Title"
                sortable
                body={(rowData) => (
                  <a
                    href={`/admin/sub-departments?SubdepatmentId=${rowData._id}`}
                    style={{ color: 'blue', textDecoration: 'underline' }}
                  >
                    {rowData.InnerDepartmentsData.data.title}
                  </a>
                )}
              />
              <Column field="InnerDepartmentsData.data.smallDescription" header="Description" />
              <Column
                header="Created At"
                body={(rowData) => formatDate(rowData?.createdAt)}
              />
              <Column
                header="Action"
                body={actionTemplate}
                align="center"
                style={{
                  minWidth: "5rem",
                  background: "#fbf7dc",
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
