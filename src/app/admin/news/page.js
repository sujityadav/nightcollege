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
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';

export default function NewsList() {
  const [newsData, setNewsData] = useState([]);
  const [deleteId, setDeleteId] = useState(null); // store selected id for delete
  const [visible, setVisible] = useState(false); // confirm dialog visibility
  const toast = useRef(null);

  useEffect(() => {
    const fetchNewsList = async () => {
      try {
        const response = await axios.get("/api/news");
        if (response?.data?.success) {
          setNewsData(response?.data?.data);
        }
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch news',
          life: 3000,
        });
      }
    };
    fetchNewsList();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/news/${id}`);
      if (response?.data?.success) {
        setNewsData(newsData.filter(item => item._id !== id));
        toast.current.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'News deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete news:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete news',
        life: 3000,
      });
    }
  };

  // Trigger delete confirmation dialog
  const confirmDelete = (id) => {
    setDeleteId(id);
    setVisible(true);
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="flex justify-center items-center gap-4">
        <Link href={`/admin/news/add-news?id=${rowData?._id}`} className="leading-none">
          <i className="pi pi-pen-to-square text-[18px] xl:text-[0.938vw]"></i>
        </Link>
        <button
          onClick={() => confirmDelete(rowData?._id)}
          className="leading-none bg-transparent border-0 cursor-pointer"
          type="button"
        >
          <i className="pi pi-trash text-[18px] xl:text-[0.938vw] text-red-500"></i>
        </button>
      </div>
    );
  };

  const formatDate = (value) =>
    value ? format(new Date(value), 'dd MMM yyyy') : '-';

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      {/* ConfirmDialog modal */}
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="Are you sure you want to delete this news?"
        header="Delete Confirmation"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Yes, Delete"
        rejectLabel="Cancel"
        acceptClassName="p-button-danger"
        accept={() => {
          handleDelete(deleteId);
          setVisible(false);
        }}
        reject={() => {
          toast.current.show({
            severity: 'info',
            summary: 'Cancelled',
            detail: 'Delete action cancelled',
            life: 2000,
          });
          setVisible(false);
        }}
      />

      <div className="p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full">
        <div className="flex justify-between mb-5">
          <h2 className="text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0">
            News
          </h2>
          <Link
            href="/admin/news/add-news"
            className="text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[16px] 3xl:px-[0.833vw] py-[8px] xl:py-[10px] 3xl:py-[0.521vw] leading-[100%] rounded-none p-button-raised flex gap-2 items-center"
          >
            <i className="pi pi-plus text-[14px]"></i> Add News
          </Link>
        </div>

        <div className="bg-white border card-shadow">
          <div className="px-[20px] xl:px-[1.042vw] py-[14px] xl:py-[0.729vw] border-b border-[#EAEDF3]">
            <div className="md:flex items-center gap-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="text-[#101828] text-[16px] xl:text-[0.833vw] font-medium">
                  All News
                </div>
                <div className="bg-[#F6F7F9] px-[12px] xl:px-[0.625vw] py-[4px] xl:py-[0.208vw] text-[#6C768B] text-[12px] xl:text-[0.625vw] rounded-[16px] xl:rounded-[0.833vw] font-medium">
                  Display 1 to 10 of 50
                </div>
              </div>
              <div className="col custSearch">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText placeholder="Search" />
                </IconField>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <DataTable
              value={newsData}
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
              <Column field="Newsdata.data.title" header="Title" sortable />
              <Column field="Newsdata.data.smallDescription" header="Description" />
              <Column field="Newsdata.data.category" header="Category" />
              <Column field="Newsdata.data.location" header="Location" />
              <Column header="From" body={(rowData) => formatDate(rowData?.Newsdata?.data?.fromDate)} />
              <Column header="To" body={(rowData) => formatDate(rowData?.Newsdata?.data?.toDate)} />
              <Column header="Created At" body={(rowData) => formatDate(rowData?.createdAt)} />
              <Column
                field="action"
                header="Action"
                className="action-shadow-table"
                frozen
                alignFrozen="right"
                align="center"
                body={actionTemplate}
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
