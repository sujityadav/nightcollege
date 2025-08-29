"use client";
import React, { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import Link from "next/link";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import { format } from "date-fns";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";

export default function NewsList() {
  const [newsData, setNewsData] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
  });

  const toast = useRef(null);

  // 🔹 Fetch paginated news
  const fetchNewsList = async (query = "", page = 1, limit = 10) => {
    try {
      const response = await axios.get("/api/news", {
        params: { search: query, page, limit },
      });

      if (response?.data?.success) {
        setNewsData(response.data.data);
        setTotalRecords(response.data.total);
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch news",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchNewsList(searchQuery, lazyParams.page, lazyParams.rows);
  }, [lazyParams, searchQuery]);

  // 🔹 debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setLazyParams((prev) => ({ ...prev, page: 1, first: 0 })); // reset to page 1 on search
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/news/${id}`);
      if (response?.data?.success) {
        fetchNewsList(searchQuery, lazyParams.page, lazyParams.rows); // refetch after delete
        toast.current.show({
          severity: "success",
          summary: "Deleted",
          detail: "News deleted successfully",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete news",
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setVisible(true);
  };

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link href={`/admin/news/add-news?id=${rowData?._id}`}>
        <i className="pi pi-pen-to-square text-[18px]"></i>
      </Link>
      <button
        onClick={() => confirmDelete(rowData?._id)}
        className="text-red-500"
        type="button"
      >
        <i className="pi pi-trash text-[18px]"></i>
      </button>
    </div>
  );

  const formatDate = (value) =>
    value ? format(new Date(value), "dd MMM yyyy") : "-";

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
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
      />

      <div className="p-[20px]">
        <div className="flex justify-between mb-5">
          <h2 className="text-[22px] font-[700]">News</h2>
          <Link
            href="/admin/news/add-news"
            className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center"
          >
            <i className="pi pi-plus"></i> Add News
          </Link>
        </div>

        <div className="bg-white border card-shadow">
          <div className="px-5 py-3 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-[16px] font-medium">All News</div>
              <div className="bg-gray-100 px-3 py-1 text-sm rounded-full">
                Total {totalRecords}
              </div>
            </div>
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search" />
              <InputText
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </IconField>
          </div>

          <div className="overflow-auto">
            <DataTable
              value={newsData}
              lazy
              paginator
              totalRecords={totalRecords}
              first={lazyParams.first}
              rows={lazyParams.rows}
              onPage={(e) => {
                setLazyParams({
                  ...lazyParams,
                  first: e.first,
                  rows: e.rows,
                  page: e.page + 1,
                });
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              currentPageReportTemplate="Rows {first} - {last} of {totalRecords}"
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              className="custTable"
              showGridlines
              responsiveLayout="scroll"
            >
              <Column field="Newsdata.data.title" header="Title" sortable />
              <Column field="Newsdata.data.smallDescription" header="Description" />
              <Column field="Newsdata.data.category" header="Category" />
              <Column field="Newsdata.data.location" header="Location" />
              <Column
                header="From"
                body={(rowData) => formatDate(rowData?.Newsdata?.data?.fromDate)}
              />
              <Column
                header="To"
                body={(rowData) => formatDate(rowData?.Newsdata?.data?.toDate)}
              />
              <Column
                header="Created At"
                body={(rowData) => formatDate(rowData?.createdAt)}
              />
              <Column
                header="Action"
                body={actionTemplate}
                frozen
                alignFrozen="right"
                align="center"
                style={{
                  minWidth: "4rem",
                  background: "#fbf7dc",
                  zIndex: 1,
                  boxShadow: "-4px 0 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
