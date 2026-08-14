'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import CommonDataTable from '@/app/components/common/DataTable';

export default function CollegePublicationList() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ first: 0, rows: 10, page: 1, sortField: 'createdAt', sortOrder: -1, search: '' });
  const [totalRecords, setTotalRecords] = useState(0);
  const toast = useRef(null);

  const fetchPublications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/college-publication', {
        params: { page: params.page, limit: params.rows, sortField: params.sortField, sortOrder: params.sortOrder, search: params.search },
      });
      setPublications(response.data?.data || []);
      setTotalRecords(response.data?.totalRecords || 0);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Unable to load publications', life: 3000 });
    } finally {
      setLoading(false);
    }
  }, [params.page, params.rows, params.search, params.sortField, params.sortOrder]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  const deletePublication = async (id) => {
    try {
      await axios.delete(`/api/college-publication/${id}`);
      toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Publication deleted successfully', life: 3000 });
      fetchPublications();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Unable to delete publication', life: 3000 });
    }
  };

  const confirmDelete = (id) => confirmDialog({
    header: 'Delete Publication',
    message: 'Are you sure you want to delete this publication?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Yes, Delete',
    rejectLabel: 'Cancel',
    acceptClassName: 'p-button-danger',
    accept: () => deletePublication(id),
  });

  const photoTemplate = (rowData) => {
    const photo = rowData?.PublicationData?.data?.photo;
    return photo ? <img src={photo} alt={rowData?.PublicationData?.data?.title || 'Publication'} className="h-14 w-14 rounded object-cover" /> : <span className="text-gray-400">No Photo</span>;
  };

  const actionTemplate = (rowData) => (
    <div className="flex items-center justify-center gap-4">
      <Link href={`/admin/college-publication/add-publication?id=${rowData._id}`} className="leading-none"><i className="pi pi-pen-to-square text-[18px]" /></Link>
      <button type="button" onClick={() => confirmDelete(rowData._id)} className="cursor-pointer border-0 bg-transparent leading-none text-red-500"><i className="pi pi-trash text-[18px]" /></button>
    </div>
  );

  const columns = [
    { header: 'Photo', body: photoTemplate, style: { minWidth: '7rem' } },
    { field: 'PublicationData.data.title', header: 'Title', sortable: true, style: { minWidth: '14rem' } },
    {
      header: 'Description',
      body: (rowData) => <div className="max-w-md line-clamp-2" dangerouslySetInnerHTML={{ __html: rowData?.PublicationData?.data?.description || '-' }} />,
      style: { minWidth: '20rem' },
    },
    { header: 'Action', body: actionTemplate, align: 'center', style: { minWidth: '6rem', background: '#fbf7dc' } },
  ];

  return (
    <div className="w-full p-[20px] xl:p-[25px]">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="mb-5 flex justify-between">
        <h2 className="m-0 text-[22px] font-[700] text-[#19212A]">College Publication</h2>
        <Link href="/admin/college-publication/add-publication" className="flex items-center gap-2 border bg-primarycolor px-4 py-2 text-white"><i className="pi pi-plus text-[14px]" /> Add Publication</Link>
      </div>

      <CommonDataTable
        value={publications}
        columns={columns}
        loading={loading}
        totalRecords={totalRecords}
        first={params.first}
        rows={params.rows}
        sortField={params.sortField}
        sortOrder={params.sortOrder}
        onPage={(event) => setParams((current) => ({ ...current, first: event.first, rows: event.rows, page: event.page + 1 }))}
        onSort={(event) => setParams((current) => ({ ...current, sortField: event.sortField, sortOrder: event.sortOrder }))}
        headerTitle="All Publications"
        showSearch
        searchValue={params.search}
        onSearch={(event) => setParams((current) => ({ ...current, search: event.target.value, first: 0, page: 1 }))}
      />
    </div>
  );
}
