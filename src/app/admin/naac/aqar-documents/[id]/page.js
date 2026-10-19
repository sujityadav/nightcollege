'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';
import CommonDataTable from '@/app/components/common/DataTable';

const narrowColStyle = { minWidth: '4.5rem', width: '4.5rem', maxWidth: '4.5rem' };

export default function AqarDocumentPartsPage() {
  const params = useParams();
  const documentId = params?.id;
  const [document, setDocument] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useRef(null);

  usePageBreadcrumbs({
    pageTitle: document?.title || 'AQAR Parts',
    breadcrumbs: [
      { label: 'NAAC', href: '/admin/naac?section=aqar-documents' },
      { label: 'AQAR - Documents Link', href: '/admin/naac?section=aqar-documents' },
      { label: document?.title || 'Parts', isCurrent: true },
    ],
  });

  const fetchParts = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/naac-aqar-documents/${documentId}/parts`);
      setDocument(response.data.data?.document || null);
      setParts(response.data.data?.parts || []);
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not load parts',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const filteredParts = useMemo(() => {
    if (!search.trim()) return parts;
    const query = search.toLowerCase();
    return parts.filter((part) => {
      const title = String(part.title || '').toLowerCase();
      const plainDescription = String(part.description || '')
        .replace(/<[^>]*>/g, ' ')
        .toLowerCase();
      return title.includes(query) || plainDescription.includes(query);
    });
  }, [parts, search]);

  const deletePart = async (partId) => {
    try {
      await axios.delete(`/api/naac-aqar-documents/${documentId}/parts/${partId}`);
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Part deleted',
        life: 2500,
      });
      fetchParts();
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not delete part',
        life: 3000,
      });
    }
  };

  const confirmDeletePart = (part) => {
    confirmDialog({
      header: 'Delete Part',
      message: `Delete "${part.title}" and all its index data?`,
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => deletePart(part._id),
    });
  };

  const columns = [
    {
      field: 'sortOrder',
      header: 'Sort Order',
      sortable: true,
      align: 'center',
      headerStyle: { textAlign: 'center' },
      body: (rowData) => rowData.sortOrder ?? 0,
      style: narrowColStyle,
    },
    {
      field: 'title',
      header: 'Title',
      sortable: true,
      body: (rowData) => (
        <Link
          href={`/admin/naac/aqar-documents/${documentId}/parts/${rowData._id}`}
          className="font-medium text-primarycolor hover:underline"
        >
          {rowData.title}
        </Link>
      ),
      style: { minWidth: '14rem' },
    },
    {
      field: 'description',
      header: 'Description',
      body: (rowData) =>
        rowData.description ? (
          <div
            className="quick-link-content line-clamp-2 max-w-xl text-[#6C768B]"
            dangerouslySetInnerHTML={{ __html: rowData.description }}
          />
        ) : (
          <span className="text-[#6C768B]">—</span>
        ),
      style: { minWidth: '16rem' },
    },
    {
      header: 'Action',
      align: 'center',
      headerStyle: { textAlign: 'center' },
      body: (rowData) => (
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/admin/naac/aqar-documents/${documentId}/parts/add?partId=${rowData._id}`}
            className="leading-none"
            title="Edit"
          >
            <i className="pi pi-pen-to-square text-[18px]" />
          </Link>
          <button
            type="button"
            onClick={() => confirmDeletePart(rowData)}
            className="cursor-pointer border-0 bg-transparent p-0 leading-none text-red-500"
            title="Delete"
          >
            <i className="pi pi-trash text-[18px]" />
          </button>
        </div>
      ),
      style: { minWidth: '6rem', width: '6rem', background: '#fbf7dc' },
    },
  ];

  return (
    <div className="w-full p-[20px] xl:p-[25px]">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-[22px] font-[700] text-[#19212A]">{document?.title || 'AQAR Parts'}</h2>
          <p className="mt-1 text-sm text-[#6C768B]">Manage parts and index data for this AQAR document.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/naac?section=aqar-documents" className="cancelbtn px-4 py-2 leading-none">
            Back
          </Link>
          <Link
            href={`/admin/naac/aqar-documents/${documentId}/parts/add`}
            className="flex items-center gap-2 bg-primarycolor px-4 py-2 text-white"
          >
            <i className="pi pi-plus text-[14px]" /> Add Part
          </Link>
        </div>
      </div>

      <CommonDataTable
        value={filteredParts}
        columns={columns}
        loading={loading}
        lazy={false}
        totalRecords={filteredParts.length}
        headerTitle="All Parts"
        showSearch
        searchPlaceholder="Search by title.."
        searchValue={search}
        onSearch={(event) => setSearch(event.target.value)}
        emptyMessage="No parts yet. Add a part to manage index data."
        dataTableProps={{ dataKey: '_id' }}
      />
    </div>
  );
}
