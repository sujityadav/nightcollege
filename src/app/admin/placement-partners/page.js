'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CommonDataTable from '@/app/components/common/DataTable';

export default function PlacementPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [params, setParams] = useState({ first: 0, rows: 10, page: 1, sortField: 'sortNo', sortOrder: 1, search: '' });
  const toast = useRef(null);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/placement-partners', { params: { page: params.page, limit: params.rows, sortField: params.sortField, sortOrder: params.sortOrder, search: params.search } });
      setPartners(response.data?.data || []);
      setTotalRecords(response.data?.totalRecords || 0);
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Unable to load placement partners', life: 3000 });
    } finally {
      setLoading(false);
    }
  }, [params.page, params.rows, params.search, params.sortField, params.sortOrder]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const deletePartner = async (id) => {
    try {
      await axios.delete(`/api/placement-partners/${id}`);
      toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Placement partner deleted successfully', life: 2500 });
      fetchPartners();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Unable to delete placement partner', life: 3000 });
    }
  };

  const columns = [
    { header: 'Image', body: (row) => row.image ? <img src={row.image} alt={row.title} className="h-14 w-24 rounded object-contain" /> : <span className="text-gray-400">No Image</span>, style: { minWidth: '8rem' } },
    { field: 'title', header: 'Title', sortable: true, style: { minWidth: '16rem' } },
    { field: 'sortNo', header: 'Sort Number', sortable: true, style: { minWidth: '8rem' }, align: 'center' },
    {
      header: 'Action', align: 'center', style: { minWidth: '6rem', background: '#fbf7dc' },
      body: (row) => <div className="flex items-center justify-center gap-4">
        <Link href={`/admin/placement-partners/add?id=${row._id}`} className="leading-none" title="Edit"><i className="pi pi-pen-to-square text-[18px]" /></Link>
        <button type="button" onClick={() => confirmDialog({ header: 'Delete Placement Partner', message: `Are you sure you want to delete \"${row.title}\"?`, icon: 'pi pi-exclamation-triangle', acceptLabel: 'Yes, Delete', rejectLabel: 'Cancel', acceptClassName: 'p-button-danger', accept: () => deletePartner(row._id) })} className="cursor-pointer border-0 bg-transparent p-0 leading-none text-red-500" title="Delete"><i className="pi pi-trash text-[18px]" /></button>
      </div>,
    },
  ];

  return <div className="w-full p-[20px] xl:p-[25px]">
    <Toast ref={toast} /><ConfirmDialog />
    <div className="mb-5 flex justify-between">
      <h2 className="m-0 text-[22px] font-[700] text-[#19212A]">Placement Partners</h2>
      <Link href="/admin/placement-partners/add" className="flex items-center gap-2 border bg-primarycolor px-4 py-2 text-white"><i className="pi pi-plus text-[14px]" /> Add Placement Partner</Link>
    </div>
    <CommonDataTable value={partners} columns={columns} loading={loading} totalRecords={totalRecords} first={params.first} rows={params.rows} sortField={params.sortField} sortOrder={params.sortOrder}
      onPage={(event) => setParams((current) => ({ ...current, first: event.first, rows: event.rows, page: event.page + 1 }))}
      onSort={(event) => setParams((current) => ({ ...current, sortField: event.sortField, sortOrder: event.sortOrder, first: 0, page: 1 }))}
      headerTitle="All Placement Partners" showSearch searchValue={params.search}
      onSearch={(event) => setParams((current) => ({ ...current, search: event.target.value, first: 0, page: 1 }))} dataTableProps={{ dataKey: '_id' }} />
  </div>;
}
