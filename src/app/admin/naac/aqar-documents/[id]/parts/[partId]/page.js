'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';
import CommonDataTable from '@/app/components/common/DataTable';
import 'suneditor/dist/css/suneditor.min.css';
import { isUnassignedSectionName } from '@/app/features/naac/constants/aqarDocument';
import AqarRowViewLink from '@/app/features/naac-public/components/AqarRowViewLink';

const narrowColStyle = { minWidth: '4.5rem', width: '4.5rem', maxWidth: '4.5rem' };

function flattenGroupsToTableRows(groups) {
  const rows = [];
  for (const group of groups || []) {
    rows.push({
      _id: `section-${group.section._id}`,
      rowType: 'section',
      section: group.section,
      srNo: '',
      details: group.section.name,
      row: null,
    });
    for (const row of group.rows || []) {
      rows.push({
        _id: String(row._id),
        rowType: 'data',
        section: group.section,
        srNo: row.srNo,
        details: row.details,
        row,
      });
    }
  }
  return rows;
}

export default function AqarDocumentPartIndexPage() {
  const params = useParams();
  const documentId = params?.id;
  const partId = params?.partId;
  const [document, setDocument] = useState(null);
  const [part, setPart] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useRef(null);

  usePageBreadcrumbs({
    pageTitle: part?.title || 'AQAR Index',
    breadcrumbs: [
      { label: 'NAAC', href: '/admin/naac?section=aqar-documents' },
      { label: 'AQAR - Documents Link', href: '/admin/naac?section=aqar-documents' },
      {
        label: document?.title || 'Parts',
        href: documentId ? `/admin/naac/aqar-documents/${documentId}` : '/admin/naac?section=aqar-documents',
      },
      { label: part?.title || 'Index', isCurrent: true },
    ],
  });

  const fetchTable = useCallback(async () => {
    if (!documentId || !partId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/naac-aqar-documents/${documentId}/rows`, {
        params: { partId },
      });
      setDocument(response.data.data?.document || null);
      setPart(response.data.data?.part || null);
      setGroups(response.data.data?.groups || []);
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not load index data',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [documentId, partId]);

  useEffect(() => {
    fetchTable();
  }, [fetchTable]);

  const tableRows = useMemo(() => flattenGroupsToTableRows(groups), [groups]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return tableRows;
    const query = search.toLowerCase();
    return tableRows.filter((item) => {
      const srNo = String(item.srNo || '').toLowerCase();
      const details = String(item.details || '').toLowerCase();
      return srNo.includes(query) || details.includes(query);
    });
  }, [tableRows, search]);

  const deleteRow = async (rowId) => {
    try {
      await axios.delete(`/api/naac-aqar-documents/${documentId}/rows/${rowId}`);
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Details entry deleted',
        life: 2500,
      });
      fetchTable();
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not delete row',
        life: 3000,
      });
    }
  };

  const deleteSection = async (section) => {
    if (isUnassignedSectionName(section.name)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Section',
        detail: 'The Unassigned section cannot be deleted',
        life: 3000,
      });
      return;
    }
    try {
      await axios.delete(`/api/naac-aqar-documents/${documentId}/sections/${section._id}`);
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Section deleted. Rows moved to Unassigned.',
        life: 3000,
      });
      fetchTable();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Could not delete section',
        life: 3000,
      });
    }
  };

  const confirmDeleteSection = (section) => {
    confirmDialog({
      header: 'Delete Section',
      message: `Delete section "${section.name}"? Its rows will move to Unassigned.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => deleteSection(section),
    });
  };

  const confirmDeleteRow = (row) => {
    confirmDialog({
      header: 'Delete Details',
      message: 'Are you sure you want to delete this details entry?',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => deleteRow(row._id),
    });
  };

  const columns = [
    {
      field: 'srNo',
      header: 'Sr. no.',
      sortable: true,
      align: 'center',
      headerStyle: { textAlign: 'center' },
      body: (rowData) => (rowData.rowType === 'section' ? '' : rowData.srNo),
      style: narrowColStyle,
    },
    {
      field: 'details',
      header: 'Details',
      sortable: true,
      body: (rowData) =>
        rowData.rowType === 'section' ? (
          <span className="font-semibold text-[#ff0000]">{rowData.details}</span>
        ) : (
          <span className="whitespace-pre-wrap">{rowData.details}</span>
        ),
      style: { minWidth: '16rem' },
    },
    {
      header: 'Link',
      body: (rowData) =>
        rowData.rowType === 'data' ? (
          <AqarRowViewLink row={rowData.row} className="text-primarycolor hover:underline" />
        ) : null,
      style: { minWidth: '6rem' },
    },
    {
      header: 'Action',
      align: 'center',
      headerStyle: { textAlign: 'center' },
      body: (rowData) => {
        if (rowData.rowType === 'section') {
          if (isUnassignedSectionName(rowData.section?.name)) return null;
          return (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => confirmDeleteSection(rowData.section)}
                className="cursor-pointer border-0 bg-transparent p-0 text-red-500"
                title="Delete section"
              >
                <i className="pi pi-trash text-[18px]" />
              </button>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center gap-3">
            <Link
              href={`/admin/naac/aqar-documents/${documentId}/parts/${partId}/rows/add?rowId=${rowData.row._id}`}
              title="Edit"
            >
              <i className="pi pi-pen-to-square text-[18px]" />
            </Link>
            <button
              type="button"
              onClick={() => confirmDeleteRow(rowData.row)}
              className="cursor-pointer border-0 bg-transparent p-0 text-red-500"
              title="Delete"
            >
              <i className="pi pi-trash text-[18px]" />
            </button>
          </div>
        );
      },
      style: { minWidth: '6rem', width: '6rem', background: '#fbf7dc' },
    },
  ];

  return (
    <div className="w-full p-[20px] xl:p-[25px]">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-[22px] font-[700] text-[#19212A]">{part?.title || 'AQAR Index'}</h2>
          {part?.description ? (
            <div
              className="quick-link-content mt-2 max-w-3xl text-sm text-[#6C768B]"
              dangerouslySetInnerHTML={{ __html: part.description }}
            />
          ) : null}
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/naac/aqar-documents/${documentId}`}
            className="cancelbtn px-4 py-2 leading-none"
          >
            Back
          </Link>
          <Link
            href={`/admin/naac/aqar-documents/${documentId}/parts/${partId}/rows/add`}
            className="flex items-center gap-2 bg-primarycolor px-4 py-2 text-white"
          >
            <i className="pi pi-plus text-[14px]" /> Add Details
          </Link>
        </div>
      </div>

      <CommonDataTable
        value={filteredRows}
        columns={columns}
        loading={loading}
        lazy={false}
        totalRecords={filteredRows.length}
        headerTitle="Index Data"
        showSearch
        searchPlaceholder="Search by sr. no. or details.."
        searchValue={search}
        onSearch={(event) => setSearch(event.target.value)}
        emptyMessage="No sections or details yet. Add details to create a section."
        dataTableProps={{
          dataKey: '_id',
          rowClassName: (rowData) =>
            rowData.rowType === 'section' ? 'bg-[#fffef5] [&>td]:!bg-[#fffef5]' : '',
        }}
      />
    </div>
  );
}
