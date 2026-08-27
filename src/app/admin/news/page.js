'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { InputSwitch } from 'primereact/inputswitch';
import CommonDataTable from '@/app/components/common/DataTable';
import { getFirstPhotoUrl } from '@/app/components/common/MediaUpload';

export default function NewsList() {
  const [newsData, setNewsData] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
  });
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const toast = useRef(null);

  const fetchNewsList = async (query = '', page = 1, limit = 10) => {
    try {
      const response = await axios.get('/api/news', {
        params: { search: query, page, limit },
      });

      if (response?.data?.success) {
        setNewsData(response.data.data);
        setTotalRecords(response.data.total);
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch news',
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchNewsList(searchQuery, lazyParams.page, lazyParams.rows);
  }, [lazyParams, searchQuery]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setLazyParams((prev) => ({ ...prev, page: 1, first: 0 }));
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/news/${id}`);
      if (response?.data?.success) {
        fetchNewsList(searchQuery, lazyParams.page, lazyParams.rows);
        toast.current.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'News deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete news',
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setVisible(true);
  };

  const handleStatusToggle = async (rowData, checked) => {
    const newStatus = checked ? 1 : 0;
    const previousStatus = Number(rowData?.Newsdata?.data?.status ?? 0);

    setNewsData((prev) =>
      prev.map((item) =>
        item._id === rowData._id
          ? {
              ...item,
              Newsdata: {
                ...item.Newsdata,
                data: {
                  ...item.Newsdata?.data,
                  status: newStatus,
                },
              },
            }
          : item
      )
    );
    setUpdatingStatusId(rowData._id);

    try {
      const response = await axios.put(`/api/news/${rowData._id}`, {
        data: {
          ...rowData.Newsdata?.data,
          status: newStatus,
        },
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to update status');
      }

      toast.current.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `News marked as ${newStatus === 1 ? 'active' : 'inactive'}`,
        life: 2500,
      });
    } catch (error) {
      setNewsData((prev) =>
        prev.map((item) =>
          item._id === rowData._id
            ? {
                ...item,
                Newsdata: {
                  ...item.Newsdata,
                  data: {
                    ...item.Newsdata?.data,
                    status: previousStatus,
                  },
                },
              }
            : item
        )
      );
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update status',
        life: 3000,
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link
        href={`/admin/news/add-news?id=${rowData?._id}`}
        className="leading-none"
        title="Edit"
      >
        <i className="pi pi-pen-to-square text-[18px]" />
      </Link>
      <button
        type="button"
        onClick={() => confirmDelete(rowData?._id)}
        className="leading-none bg-transparent border-0 cursor-pointer text-red-500 p-0"
        title="Delete"
      >
        <i className="pi pi-trash text-[18px]" />
      </button>
    </div>
  );

  const formatDate = (value) =>
    value ? format(new Date(value), 'dd MMM yyyy') : '-';

  const formatCategories = (value) => {
    if (!value) return '-';
    if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '-';
    return String(value);
  };

  const imageTemplate = (rowData) => {
    const imageUrl = getFirstPhotoUrl(rowData?.Newsdata?.data);

    if (!imageUrl) {
      return <span className="text-gray-400 text-sm">No Image</span>;
    }

    return (
      <img
        src={imageUrl}
        alt={rowData?.Newsdata?.data?.title || 'News'}
        className="h-14 w-24 rounded object-cover"
      />
    );
  };

  const columns = [
    {
      header: 'Image',
      body: imageTemplate,
      style: { minWidth: '7rem' },
    },
    { field: 'Newsdata.data.title', header: 'Title', sortable: true },
    { field: 'Newsdata.data.smallDescription', header: 'Description' },
    {
      header: 'Category',
      body: (rowData) => formatCategories(rowData?.Newsdata?.data?.category),
      style: { minWidth: '10rem' },
    },
    { field: 'Newsdata.data.location', header: 'Location' },
    {
      header: 'From',
      body: (rowData) => formatDate(rowData?.Newsdata?.data?.fromDate),
    },
    {
      header: 'To',
      body: (rowData) => formatDate(rowData?.Newsdata?.data?.toDate),
    },
    {
      header: 'Created At',
      body: (rowData) => formatDate(rowData?.createdAt),
    },
    {
      header: 'Status',
      body: (rowData) => (
        <InputSwitch
          checked={Number(rowData?.Newsdata?.data?.status) === 1}
          disabled={updatingStatusId === rowData._id}
          onChange={(event) => handleStatusToggle(rowData, event.value)}
        />
      ),
      align: 'center',
      style: { minWidth: '6rem' },
    },
    {
      header: 'Action',
      body: actionTemplate,
      frozen: true,
      alignFrozen: 'right',
      align: 'center',
      style: {
        minWidth: '6rem',
        background: '#fbf7dc',
        zIndex: 1,
        boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  ];

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

        <CommonDataTable
          value={newsData}
          columns={columns}
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
          tableClassName="custTable"
          headerTitle={
            <div className="flex items-center gap-4">
              <span>All News</span>
              <span className="bg-gray-100 px-3 py-1 text-sm rounded-full font-normal">
                Total {totalRecords}
              </span>
            </div>
          }
          showSearch
          searchPlaceholder="Search here.."
          searchValue={searchQuery}
          onSearch={(e) => setSearchQuery(e.target.value)}
          dataTableProps={{ responsiveLayout: 'scroll' }}
        />
      </div>
    </div>
  );
}
