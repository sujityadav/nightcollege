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
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import Image from 'next/image';

export default function AlumniList() {
  const router = useRouter();
  const [alumniData, setAlumniData] = useState([]);
  const toast = useRef(null);

  useEffect(() => {
    const fetchAlumniList = async () => {
      try {
        const response = await axios.get("/api/alumni");
        if (response?.data?.success) {
          setAlumniData(response?.data?.data);
        }
      } catch (err) {
        console.error("Failed to fetch alumni:", err);
      }
    };
    fetchAlumniList();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/alumni/${id}`);
      if (response?.data?.success) {
        setAlumniData(alumniData.filter(item => item._id !== id));
        toast.current.show({
          severity: 'success',
          summary: 'Success',
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

  const actionTemplate = (rowData) => {
    return (
      <div className="flex justify-center items-center gap-4">
        <Link href={`/admin/alumni/add-alumni?id=${rowData?._id}`} className="leading-none">
          <i className="pi pi-pen-to-square text-[18px]"></i>
        </Link>
        <button onClick={() => handleDelete(rowData?._id)} className="leading-none">
          <i className="pi pi-trash text-[18px]"></i>
        </button>
      </div>
    );
  };

  const photoTemplate = (rowData) => {
    return rowData?.AlumniData?.data?.profilePhoto ? (
      <Image
        src={rowData.profilePhoto}
        alt="Alumni"
        width={40}
        height={40}
        className="rounded-full"
      />
    ) : (
      <span className="text-gray-400">No Photo</span>
    );
  };

  const formatDate = (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-';

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <div className='p-[20px] xl:p-[25px] w-full'>
        <div className='flex justify-between mb-5'>
          <div>
            <h2 className='text-[#19212A] text-[14px] xl:text-[22px] font-[700] m-0'>Alumni</h2>
          </div>
          <div>
            <Link href='/admin/alumni/add-alumni' className='text-white border bg-primarycolor border-[#af251c] px-4 py-2 flex gap-2 items-center'>
              <i className='pi pi-plus text-[14px]'></i> Add Alumni
            </Link>
          </div>
        </div>

        <div className='bg-white border card-shadow'>
          <div className='px-[20px] py-[14px] border-b border-[#EAEDF3]'>
            <div className="md:flex items-center gap-2 justify-between">
              <div className='flex items-center gap-4'>
                <div className="text-[#101828] text-[16px] font-medium">
                  All Alumni
                </div>
                <div className="bg-[#F6F7F9] px-3 py-1 text-[#6C768B] text-[12px] rounded-full font-medium">
                  {alumniData.length} Records
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
              value={alumniData}
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
              <Column header="Photo" body={photoTemplate} style={{ minWidth: '6rem' }} />
              <Column field="AlumniData.data.fullName" header="Name" sortable />
              <Column
                header="Batch Year"
                body={(rowData) => rowData?.AlumniData?.data?.batchYear ? new Date(rowData?.AlumniData?.data?.batchYear).getFullYear() : '-'}
              />
              <Column field="AlumniData.data.course" header="Course" sortable />
              <Column field="AlumniData.data.position" header="Position" />
              <Column field="AlumniData.data.company" header="Company" />
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
