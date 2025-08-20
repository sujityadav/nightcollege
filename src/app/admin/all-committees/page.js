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
import { Tag } from 'primereact/tag';
import axios from 'axios';
import { format } from 'date-fns';
import { Toast } from 'primereact/toast';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';

export default function EventList() {
  const [eventsData, setEventsData] = useState([]);
  const toast = useRef(null);

  useEffect(() => {
    const fetchEventList = async () => {
      const response = await axios.get("/api/commities");
      if (response?.data?.success) {
        setEventsData(response?.data?.data)
      }
    }
    fetchEventList()
  }, [])

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/commities/${id}`);
      if (response?.data?.success) {
        setEventsData(eventsData.filter(item => item._id !== id));
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Committee deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete committee:', error);
      toast.current.show({
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
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(id),
    });
  };

  const actionTemplate = (product) => {
    return (
      <div className="flex justify-center items-center gap-4">
        <Link
          href={`/admin/all-committees/add-committee?id=${product?._id}`}
          className="leading-none"
        >
          <i className="pi pi-pen-to-square text-[18px] xl:text-[0.938vw]"></i>
        </Link>

        <button
          onClick={() => confirmDelete(product?._id)}
          className="leading-none text-red-500"
        >
          <i className="pi pi-trash text-[18px] xl:text-[0.938vw]"></i>
        </button>
      </div>
    );
  };

  const formatDate = (value) =>
    value ? format(new Date(value), 'dd MMM yyyy') : '-';

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog /> {/* 🔥 Required for confirmation popup */}

      <div className="p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full">
        <div className="flex justify-between mb-5">
          <h2 className="text-[#19212A] text-[14px] xl:text-[22px] font-[700] m-0">
            Committees
          </h2>
          <Link
            href="/admin/all-committees/add-committee"
            className="text-white border bg-primarycolor border-[#af251c] px-[14px] py-[8px] leading-[100%] rounded-none p-button-raised flex gap-2 items-center"
          >
            <i className="pi pi-plus text-[14px]"></i> Add Committee
          </Link>
        </div>

        <div className="bg-white border card-shadow">
          <div className="px-[20px] py-[14px] border-b border-[#EAEDF3]">
            <div className="md:flex items-center gap-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="text-[#101828] text-[16px] font-medium">
                  All Committees
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

          <div className="overflow-auto">
            <DataTable
              value={eventsData}
              className="custTable tableCust"
              scrollable
              showGridlines
              responsiveLayout="scroll"
              style={{ width: '100%' }}
              paginator
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows {first} - {last} of {totalRecords}"
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            >
              <Column
                header="Title"
                sortable
                body={(rowData) => {
                  const title = rowData?.CommitiesData?.data?.title || '-';
                  const hasActivities = rowData?.CommitiesData?.data?.hasActivities;

                  return hasActivities ? (
                    <Link
                      href={`/admin/all-committees/view-committee?id=${rowData._id}`}
                      style={{ color: 'blue', textDecoration: 'underline' }}
                    >
                      {title}
                    </Link>
                  ) : (
                    <span>{title}</span>
                  );
                }}
              />

              <Column
                field="CommitiesData.data.smallDescription"
                header="Description"
              />

              <Column
                header="Created At"
                body={(rowData) => formatDate(rowData?.createdAt)}
              />

              <Column
                header="Action"
                body={actionTemplate}
                align="center"
                style={{
                  minWidth: '4rem',
                  background: '#fbf7dc',
                  zIndex: 1,
                  boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
