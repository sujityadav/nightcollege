'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

export default function AnnouncementsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1, search: '' });
  const toast = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/announcements', { params: { page: lazyParams.page, limit: lazyParams.rows, search: lazyParams.search } });
      setData(response.data.data || []);
      setTotalRecords(response.data.total || 0);
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load announcements', life: 3000 });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [lazyParams]);

  const handleStatusToggle = async (rowData, status) => {
    const previousStatus = rowData.status;
    setData((items) => items.map((item) => item._id === rowData._id ? { ...item, status } : item));
    setUpdatingStatusId(rowData._id);
    try {
      const response = await axios.put(`/api/announcements/${rowData._id}`, { status });
      if (!response.data.success) throw new Error();
      toast.current?.show({ severity: 'success', summary: 'Status updated', detail: `Announcement marked ${status ? 'active' : 'inactive'}`, life: 2500 });
    } catch {
      setData((items) => items.map((item) => item._id === rowData._id ? { ...item, status: previousStatus } : item));
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not update status', life: 3000 });
    } finally { setUpdatingStatusId(null); }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const response = await axios.delete(`/api/announcements/${id}`);
      if (!response.data.success) throw new Error();
      toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Announcement deleted successfully', life: 2500 });
      fetchData();
    } catch { toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not delete announcement', life: 3000 }); }
  };

  const confirmDelete = (rowData) => confirmDialog({ header: 'Delete Announcement', message: `Are you sure you want to delete "${rowData.title}"?`, icon: 'pi pi-exclamation-triangle', acceptLabel: 'Yes, Delete', rejectLabel: 'Cancel', acceptClassName: 'p-button-danger', accept: () => deleteAnnouncement(rowData._id) });
  const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
  const descriptionTemplate = (rowData) => <span>{rowData.description.replace(/<[^>]*>/g, '').slice(0, 120) || '-'}</span>;
  const actionTemplate = (rowData) => <div className="flex justify-center items-center gap-4"><Link href={`/admin/announcements/add?id=${rowData._id}`} className="leading-none"><i className="pi pi-pen-to-square text-[18px]" /></Link><button type="button" onClick={() => confirmDelete(rowData)} className="leading-none bg-transparent border-0 cursor-pointer text-red-500"><i className="pi pi-trash text-[18px]" /></button></div>;
  const serialNumberTemplate = (_rowData, options) => lazyParams.first + options.rowIndex + 1;
  const handleSearch = (event) => setLazyParams((params) => ({ ...params, search: event.target.value, first: 0, page: 1 }));

  return <div className="min-w-0 flex-1 p-5"><Toast ref={toast} /><ConfirmDialog />
    <div className="flex justify-between mb-5"><h2 className="text-[#19212A] text-[22px] font-[700]">Announcements</h2><Link href="/admin/announcements/add" className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center"><i className="pi pi-plus text-[14px]" /> Add</Link></div>
    <div className="bg-white border card-shadow min-w-0 overflow-hidden"><div className="px-5 py-3 border-b border-[#EAEDF3] flex justify-between items-center"><div className="text-[#101828] font-medium">All Announcements</div><IconField iconPosition="left" className="app-search-field"><InputIcon className="pi pi-search" /><InputText placeholder="Search here.." value={lazyParams.search} onChange={handleSearch} /></IconField></div>
      <div className="min-w-0 overflow-x-auto"><DataTable value={data} className="custTable tableCust" scrollable showGridlines loading={loading} paginator lazy totalRecords={totalRecords} onPage={(event) => setLazyParams((params) => ({ ...params, first: event.first, rows: event.rows, page: event.page + 1 }))} first={lazyParams.first} rows={lazyParams.rows} rowsPerPageOptions={[5, 10, 25, 50]} currentPageReportTemplate={`Rows ${lazyParams.first + 1} - ${lazyParams.first + data.length} of ${totalRecords}`} paginatorTemplate="CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink">
        <Column header="Sr.No." body={serialNumberTemplate} style={{ minWidth: '3rem' }} /><Column field="sortNo" header="Sort Number" sortable style={{ minWidth: '7rem' }} /><Column field="title" header="Title" style={{ minWidth: '10rem' }} /><Column header="Description" body={descriptionTemplate} style={{ minWidth: '14rem' }} /><Column header="Status" body={(rowData) => <InputSwitch checked={rowData.status} disabled={updatingStatusId === rowData._id} onChange={(event) => handleStatusToggle(rowData, event.value)} />} style={{ minWidth: '6rem' }} /><Column header="From (Date)" body={(rowData) => formatDate(rowData.fromDate)} style={{ minWidth: '8rem' }} /><Column header="To (Date)" body={(rowData) => formatDate(rowData.toDate)} style={{ minWidth: '8rem' }} /><Column header="Action" body={actionTemplate} align="center" style={{ minWidth: '6rem', background: '#fbf7dc' }} />
      </DataTable></div></div></div>;
}
