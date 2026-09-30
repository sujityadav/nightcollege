'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import CommonDataTable from '@/app/components/common/DataTable';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

function formatMasterYearLabel(masterYear) {
  if (!masterYear) return '-';
  if (typeof masterYear === 'object' && masterYear.fromYear != null && masterYear.toYear != null) {
    return `${masterYear.fromYear} – ${masterYear.toYear}`;
  }
  return '-';
}

function isPreviewableImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('/image/upload/') ||
    /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url)
  );
}

export default function StudentCornerPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1, search: '' });
  const [filePreview, setFilePreview] = useState(null);
  const toast = useRef(null);

  const openFilePreview = (rowData) => {
    if (!rowData?.fileUrl) return;
    setFilePreview({
      url: rowData.fileUrl,
      title: rowData.title || rowData.fileName || 'File preview',
      isImage: isPreviewableImageUrl(rowData.fileUrl),
    });
  };

  const filePreviewTemplate = (rowData) => {
    const fileUrl = rowData.fileUrl;

    if (!fileUrl) {
      return <span className="text-gray-400 text-sm">No File</span>;
    }

    if (isPreviewableImageUrl(fileUrl)) {
      return (
        <button
          type="button"
          onClick={() => openFilePreview(rowData)}
          className="block cursor-pointer border-0 bg-transparent p-0"
          title="Preview file"
        >
          <img
            src={fileUrl}
            alt={rowData.title || rowData.fileName || 'Student corner file'}
            className="h-14 w-24 rounded object-cover"
          />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => openFilePreview(rowData)}
        className="flex h-14 w-24 cursor-pointer items-center justify-center rounded border border-[#EAEDF3] bg-[#F9FAFB] text-primarycolor"
        title="Preview file"
      >
        <i className="pi pi-file text-[22px]" />
      </button>
    );
  };

  usePageBreadcrumbs({
    pageTitle: 'Student Corner',
    breadcrumbs: [{ label: 'Student Corner', isCurrent: true }],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/student-corner', {
        params: {
          page: lazyParams.page,
          limit: lazyParams.rows,
          search: lazyParams.search,
        },
      });
      setData(response.data.data || []);
      setTotalRecords(response.data.total || 0);
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not load student corner items',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [lazyParams.page, lazyParams.rows, lazyParams.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusToggle = async (rowData, status) => {
    const previousStatus = rowData.status;
    setData((items) => items.map((item) => (item._id === rowData._id ? { ...item, status } : item)));
    setUpdatingStatusId(rowData._id);

    try {
      const response = await axios.put(`/api/student-corner/${rowData._id}`, { status });
      if (!response.data.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Item marked ${status ? 'active' : 'inactive'}`,
        life: 2500,
      });
    } catch {
      setData((items) =>
        items.map((item) => (item._id === rowData._id ? { ...item, status: previousStatus } : item))
      );
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not update status', life: 3000 });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await axios.delete(`/api/student-corner/${id}`);
      if (!response.data.success) throw new Error();
      toast.current?.show({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Student corner item deleted successfully',
        life: 2500,
      });
      fetchData();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not delete item', life: 3000 });
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      header: 'Delete Student Corner Item',
      message: `Are you sure you want to delete "${rowData.title}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => deleteItem(rowData._id),
    });
  };

  const columns = [
    {
      header: 'File',
      body: filePreviewTemplate,
      style: { minWidth: '7rem' },
    },
    { field: 'title', header: 'Title', style: { minWidth: '12rem' } },
    {
      header: 'Description',
      body: (rowData) => (
        <span>{rowData.description?.replace(/<[^>]*>/g, '').slice(0, 120) || '-'}</span>
      ),
      style: { minWidth: '14rem' },
    },
    {
      header: 'Year',
      body: (rowData) => formatMasterYearLabel(rowData.masterYearId),
      style: { minWidth: '8rem' },
    },
    {
      header: 'Sort Order',
      field: 'sortOrder',
      style: { minWidth: '6rem' },
      align: 'center',
    },
    {
      header: 'Status',
      body: (rowData) => (
        <InputSwitch
          checked={Boolean(rowData.status)}
          disabled={updatingStatusId === rowData._id}
          onChange={(event) => handleStatusToggle(rowData, event.value)}
        />
      ),
      style: { minWidth: '6rem' },
    },
    {
      header: 'Action',
      body: (rowData) => (
        <div className="flex justify-center items-center gap-4">
          <Link href={`/admin/student-corner/add?id=${rowData._id}`} className="leading-none" title="Edit">
            <i className="pi pi-pen-to-square text-[18px]" />
          </Link>
          <button
            type="button"
            onClick={() => confirmDelete(rowData)}
            className="leading-none bg-transparent border-0 cursor-pointer text-red-500 p-0"
            title="Delete"
          >
            <i className="pi pi-trash text-[18px]" />
          </button>
        </div>
      ),
      align: 'center',
      style: { minWidth: '6rem', background: '#fbf7dc' },
    },
  ];

  return (
    <div className="min-w-0 flex-1 p-5">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Dialog
        visible={Boolean(filePreview)}
        onHide={() => setFilePreview(null)}
        header={filePreview?.title || 'File preview'}
        modal
        dismissableMask
        className="max-w-[90vw]"
        style={{ width: '42rem' }}
      >
        {filePreview?.isImage ? (
          <img
            src={filePreview.url}
            alt={filePreview.title}
            className="mx-auto max-h-[70vh] max-w-full object-contain"
          />
        ) : (
          <iframe
            src={filePreview?.url}
            title={filePreview?.title || 'File preview'}
            className="h-[70vh] w-full border-0"
          />
        )}
      </Dialog>
      <div className="flex justify-between mb-5">
        <h2 className="text-[#19212A] text-[22px] font-[700]">Student Corner</h2>
        <Link href="/admin/student-corner/add" className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center">
          <i className="pi pi-plus text-[14px]" /> Add
        </Link>
      </div>
      <CommonDataTable
        value={data}
        columns={columns}
        loading={loading}
        totalRecords={totalRecords}
        first={lazyParams.first}
        rows={lazyParams.rows}
        onPage={(event) =>
          setLazyParams((params) => ({ ...params, first: event.first, rows: event.rows, page: event.page + 1 }))
        }
        headerTitle="All Student Corner Items"
        showSearch
        searchPlaceholder="Search here.."
        searchValue={lazyParams.search}
        onSearch={(event) =>
          setLazyParams((params) => ({ ...params, search: event.target.value, first: 0, page: 1 }))
        }
        dataTableProps={{ dataKey: '_id' }}
      />
    </div>
  );
}
