"use client";
import React, { useEffect, useRef, useState } from "react";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { InputText } from "primereact/inputtext";
import Link from "next/link";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import { format } from "date-fns";
import { Toast } from "primereact/toast";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";

export default function EventList() {
  const [eventsData, setEventsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: "createdAt",
    sortOrder: -1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useRef(null);

  // Fetch Committees List
  const fetchEventList = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/commities", {
        params: {
          page: lazyParams.page,
          limit: lazyParams.rows,
          sortField: lazyParams.sortField,
          sortOrder: lazyParams.sortOrder,
          search: searchQuery,
        },
      });

      if (response?.data?.success) {
        setEventsData(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch committees",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventList();
  }, [lazyParams, searchQuery]);

  // debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setLazyParams({ ...lazyParams, page: 1, first: 0 }); // reset to page 1
      fetchEventList();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Delete committee
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/commities/${id}`);
      if (response?.data?.success) {
        fetchEventList();
        toast.current.show({
          severity: "success",
          summary: "Deleted",
          detail: "Committee deleted successfully",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete committee",
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: "Are you sure you want to delete this committee?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes, Delete",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-danger",
      accept: () => handleDelete(id),
    });
  };

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link
        href={`/admin/all-committees/add-committee?id=${rowData?._id}`}
        className="leading-none"
      >
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

  const formatDate = (value) =>
    value ? format(new Date(value), "dd MMM yyyy") : "-";

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-[20px] xl:p-[25px] w-full">
        <div className="flex justify-between mb-5">
          <h2 className="text-[#19212A] text-[22px] font-[700] m-0">
            Committees
          </h2>
          <Link
            href="/admin/all-committees/add-committee"
            className="text-white border bg-primarycolor border-[#af251c] px-[14px] py-[8px] flex gap-2 items-center"
          >
            <i className="pi pi-plus text-[14px]"></i> Add Committee
          </Link>
        </div>

        <div className="bg-white border card-shadow">
          <div className="px-[20px] py-[14px] border-b border-[#EAEDF3] flex justify-between items-center">
            <div className="text-[#101828] text-[16px] font-medium">
              All Committees
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
              value={eventsData}
              lazy
              paginator
              totalRecords={totalRecords}
              loading={loading}
              first={lazyParams.first}
              rows={lazyParams.rows}
              onPage={(e) => setLazyParams({ ...lazyParams, ...e, page: e.page + 1 })}
              sortField={lazyParams.sortField}
              sortOrder={lazyParams.sortOrder}
              onSort={(e) => setLazyParams({ ...lazyParams, ...e })}
              rowsPerPageOptions={[5, 10, 25, 50]}
              className="custTable tableCust"
              scrollable
              showGridlines
              responsiveLayout="scroll"
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows {first} - {last} of {totalRecords}"
            >
              <Column
                header="Title"
                sortable
                body={(rowData) => {
                  const title = rowData?.CommitiesData?.data?.title || "-";
                  const hasActivities =
                    rowData?.CommitiesData?.data?.hasActivities;

                  return hasActivities ? (
                    <Link
                      href={`/admin/all-committees/view-committee?id=${rowData._id}`}
                      style={{ color: "blue", textDecoration: "underline" }}
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
                sortable
                body={(rowData) => formatDate(rowData?.createdAt)}
              />
              <Column
                header="Action"
                body={actionTemplate}
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
