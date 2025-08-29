'use client';
import React, { useEffect, useRef, useState } from 'react'
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

export default function EventList() {
  const [eventsData, setEventsData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const toast = useRef(null);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchEventList = async () => {
    try {
      const response = await axios.get(`/api/events?search=${search}&page=${page}&limit=${limit}`);
      if (response?.data?.success) {
        setEventsData(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch events',
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchEventList();
  }, [search, page, limit]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/events/${id}`);
      if (response?.data?.success) {
        fetchEventList(); // reload instead of filter (to handle pagination)
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Event deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete event',
        life: 3000,
      });
    }
  };

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link href={`/admin/events/add-events?id=${rowData?._id}`} className="leading-none">
        <i className="pi pi-pen-to-square text-[18px]"></i>
      </Link>
      <button onClick={() => { setDeleteId(rowData._id); setDeleteDialogVisible(true); }} className="leading-none text-red-600">
        <i className="pi pi-trash text-[18px]"></i>
      </button>
    </div>
  );

  const formatDate = (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-';

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        message="Are you sure you want to delete this event?"
        header="Confirm Deletion"
        icon="pi pi-exclamation-triangle"
        acceptClassName="p-button-danger"
        accept={() => { handleDelete(deleteId); setDeleteDialogVisible(false); }}
      />

      <div className="p-5 w-full">
        <div className="flex justify-between mb-5">
          <h2 className="text-[#19212A] text-[22px] font-bold m-0">Events</h2>
          <Link href="/admin/events/add-events" className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center">
            <i className="pi pi-plus"></i> Add Events
          </Link>
        </div>

        <div className="bg-white border card-shadow">
          <div className="px-5 py-3 border-b border-[#EAEDF3]">
            <div className="md:flex items-center gap-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="text-[#101828] text-[16px] font-medium">All Events</div>
                <div className="bg-[#F6F7F9] px-3 py-1 text-[#6C768B] text-[12px] rounded-[16px] font-medium">
                  {totalRecords} total
                </div>
              </div>
              <div className="col custSearch">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText placeholder="Search" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
                </IconField>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <DataTable
              value={eventsData}
              paginator
              rows={limit}
              totalRecords={totalRecords}
              lazy
              first={(page - 1) * limit}
              onPage={(e) => {
                setPage(e.page + 1);
                setLimit(e.rows);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Rows {first} - {last} of {totalRecords}"
            >
              <Column field="Eventdata.data.title" header="Title" sortable />
              <Column field="Eventdata.data.smallDescription" header="Description" />
              <Column field="Eventdata.data.category" header="Category" />
              <Column field="Eventdata.data.location" header="Location" />
              <Column header="From" body={(rowData) => formatDate(rowData?.Eventdata?.data?.fromDate)} />
              <Column header="To" body={(rowData) => formatDate(rowData?.Eventdata?.data?.toDate)} />
              <Column header="Created At" body={(rowData) => formatDate(rowData?.createdAt)} />
              <Column header="Action" body={actionTemplate} align="center" style={{ minWidth: "4rem" }} />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
