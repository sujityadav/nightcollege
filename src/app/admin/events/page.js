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
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

export default function EventList() {
  // Set breadcrumbs for this page - automatically generated from path
  usePageBreadcrumbs({
    pageTitle: 'Events Management',
    pathLabels: {
      '/admin': 'Dashboard',
      '/admin/events': 'Events'
    }
  });

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
      });
    }
  };

  useEffect(() => {
    fetchEventList();
  }, [page, limit, search]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/events/${id}`);
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Event deleted successfully',
      });
      fetchEventList();
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete event',
      });
    }
    setDeleteDialogVisible(false);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogVisible(true);
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Link
          href={`/admin/events/add-events?id=${rowData._id}`}
          className="p-button p-button-success p-button-text"
        >
          Edit
        </Link>
        <button
          onClick={() => confirmDelete(rowData._id)}
          className="p-button p-button-danger p-button-text"
        >
          Delete
        </button>
      </div>
    );
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        message="Are you sure you want to delete this event?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={() => handleDelete(deleteId)}
        reject={() => setDeleteDialogVisible(false)}
        acceptClassName="p-button-danger"
        rejectClassName="p-button-secondary"
      />

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Events</h2>
          <Link
            href="/admin/events/add-events"
            className="p-button p-button-primary"
          >
            Add Event
          </Link>
        </div>

        <div className="mb-4">
          <IconField>
            <InputIcon className="pi pi-search" />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full"
            />
          </IconField>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <DataTable
              value={eventsData}
              paginator
              rows={limit}
              rowsPerPageOptions={[5, 10, 25, 50]}
              totalRecords={totalRecords}
              lazy
              onPage={(e) => {
                setPage(e.page + 1);
                setLimit(e.rows);
              }}
              loading={false}
              emptyMessage="No events found."
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
