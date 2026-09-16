'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { InputSwitch } from 'primereact/inputswitch';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';
import CommonDataTable from '@/app/components/common/DataTable';
import { getFirstPhotoUrl } from '@/app/components/common/MediaUpload';

export default function DepartmentalActivityList() {
  const [activitiesData, setActivitiesData] = useState([]);
  const [search, setSearch] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
  });
  const [depatmentId, setDepatmentId] = useState(null);
  const [SubdepatmentId, setSubdepatmentId] = useState(null);
  const toast = useRef(null);
  const searchParams = useSearchParams();
  const subDepartmentId = searchParams.get('subDepartmentId');

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const subjectsListUrl = depatmentId ? `/admin/subjects?depatmentId=${depatmentId}` : null;
  const subPointsListUrl =
    SubdepatmentId && depatmentId
      ? `/admin/sub-points?SubdepatmentId=${SubdepatmentId}&depatmentId=${depatmentId}`
      : SubdepatmentId
        ? `/admin/sub-points?SubdepatmentId=${SubdepatmentId}`
        : null;

  usePageBreadcrumbs({
    pageTitle: 'Departmental Activity',
    breadcrumbs: [
      { label: 'All Departments', href: '/admin/all-departments' },
      ...(subjectsListUrl ? [{ label: 'Subjects', href: subjectsListUrl }] : []),
      ...(subPointsListUrl ? [{ label: 'Sub Points', href: subPointsListUrl }] : []),
      { label: 'Departmental Activity', isCurrent: true },
    ],
  });

  useEffect(() => {
    if (!subDepartmentId) return;

    const fetchParentBreadcrumbData = async () => {
      try {
        const response = await axios.get('/api/subdepartment/getbyId', {
          params: { id: subDepartmentId },
        });
        const subjectId = response.data?.data?.[0]?.SubDepartmentsData?.data?.SubdepatmentId;
        if (subjectId) setSubdepatmentId(subjectId);

        if (subjectId) {
          const subjectResponse = await axios.get('/api/innerdepartments/getbyId', {
            params: { id: subjectId },
          });
          const parentId =
            subjectResponse.data?.data?.[0]?.InnerDepartmentsData?.data?.depatmentId;
          if (parentId) setDepatmentId(parentId);
        }
      } catch (error) {
        console.error('Failed to fetch breadcrumb data:', error);
      }
    };

    fetchParentBreadcrumbData();
  }, [subDepartmentId]);

  const fetchActivityList = async () => {
    if (!subDepartmentId) return;
    try {
      const response = await axios.get('/api/departmentalactivity', {
        params: {
          subDepartmentId,
          search,
          page: lazyParams.page,
          limit: lazyParams.rows,
        },
      });
      if (response?.data?.success) {
        setActivitiesData(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch departmental activities',
      });
    }
  };

  useEffect(() => {
    fetchActivityList();
  }, [subDepartmentId, lazyParams, search]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  const formatCategories = (value) => {
    if (!value) return '-';
    if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '-';
    return String(value);
  };

  const imageTemplate = (rowData) => {
    const imageUrl = getFirstPhotoUrl(rowData?.DepartmentlActivityData?.data);

    if (!imageUrl) {
      return <span className="text-gray-400 text-sm">No Image</span>;
    }

    return (
      <img
        src={imageUrl}
        alt={rowData?.DepartmentlActivityData?.data?.title || 'Departmental Activity'}
        className="h-14 w-24 rounded object-cover"
      />
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/departmentalactivity/${id}`);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Departmental activity deleted successfully',
      });
      fetchActivityList();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete departmental activity',
      });
    }
    setDeleteDialogVisible(false);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogVisible(true);
  };

  const handleStatusToggle = async (rowData, checked) => {
    const newStatus = checked ? 1 : 0;
    const previousStatus = Number(rowData?.DepartmentlActivityData?.data?.status ?? 0);

    setActivitiesData((prev) =>
      prev.map((item) =>
        item._id === rowData._id
          ? {
              ...item,
              DepartmentlActivityData: {
                ...item.DepartmentlActivityData,
                data: {
                  ...item.DepartmentlActivityData?.data,
                  status: newStatus,
                },
              },
            }
          : item
      )
    );
    setUpdatingStatusId(rowData._id);

    try {
      const response = await axios.put(`/api/departmentalactivity/${rowData._id}`, {
        data: {
          ...rowData.DepartmentlActivityData?.data,
          status: newStatus,
        },
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to update status');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Status updated',
        detail: `Departmental activity marked as ${newStatus === 1 ? 'active' : 'inactive'}`,
        life: 2500,
      });
    } catch (error) {
      setActivitiesData((prev) =>
        prev.map((item) =>
          item._id === rowData._id
            ? {
                ...item,
                DepartmentlActivityData: {
                  ...item.DepartmentlActivityData,
                  data: {
                    ...item.DepartmentlActivityData?.data,
                    status: previousStatus,
                  },
                },
              }
            : item
        )
      );
      toast.current?.show({
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
        href={`/admin/departmentalactivity/create-departmentalactivity?id=${rowData._id}&subDepartmentId=${subDepartmentId}`}
        className="leading-none"
        title="Edit"
      >
        <i className="pi pi-pen-to-square text-[18px]" />
      </Link>
      <button
        type="button"
        onClick={() => confirmDelete(rowData._id)}
        className="leading-none bg-transparent border-0 cursor-pointer text-red-500 p-0"
        title="Delete"
      >
        <i className="pi pi-trash text-[18px]" />
      </button>
    </div>
  );

  const columns = [
    {
      header: 'Image',
      body: imageTemplate,
      style: { minWidth: '7rem' },
    },
    {
      field: 'DepartmentlActivityData.data.title',
      header: 'Title',
      sortable: true,
      style: { minWidth: '10rem' },
    },
    {
      field: 'DepartmentlActivityData.data.smallDescription',
      header: 'Description',
      style: { minWidth: '12rem' },
    },
    {
      header: 'Category',
      body: (rowData) => formatCategories(rowData?.DepartmentlActivityData?.data?.category),
      style: { minWidth: '10rem' },
    },
    {
      field: 'DepartmentlActivityData.data.location',
      header: 'Location',
      style: { minWidth: '8rem' },
    },
    {
      header: 'From',
      body: (rowData) => formatDate(rowData?.DepartmentlActivityData?.data?.fromDate),
      style: { minWidth: '8rem' },
    },
    {
      header: 'To',
      body: (rowData) => formatDate(rowData?.DepartmentlActivityData?.data?.toDate),
      style: { minWidth: '8rem' },
    },
    {
      header: 'Created At',
      body: (rowData) => formatDate(rowData?.createdAt),
      style: { minWidth: '8rem' },
    },
    {
      header: 'Status',
      body: (rowData) => (
        <InputSwitch
          checked={Number(rowData?.DepartmentlActivityData?.data?.status) === 1}
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
      align: 'center',
      style: { minWidth: '6rem', background: '#fbf7dc' },
    },
  ];

  return (
    <div className="p-5">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        message="Are you sure you want to delete this departmental activity?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={() => handleDelete(deleteId)}
        reject={() => setDeleteDialogVisible(false)}
        acceptClassName="p-button-danger"
        rejectClassName="p-button-secondary"
      />

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[#19212A] text-[22px] font-[700]">Departmental Activity</h2>
        <Link
          href={`/admin/departmentalactivity/create-departmentalactivity?subDepartmentId=${subDepartmentId}`}
          className="text-white bg-primarycolor px-4 py-2 flex gap-2 items-center"
        >
          <i className="pi pi-plus text-[14px]" /> Add Departmental Activity
        </Link>
      </div>

      <CommonDataTable
        value={activitiesData}
        columns={columns}
        totalRecords={totalRecords}
        first={lazyParams.first}
        rows={lazyParams.rows}
        onPage={(e) => {
          setLazyParams({
            first: e.first,
            rows: e.rows,
            page: e.page + 1,
          });
        }}
        emptyMessage="No departmental activities found."
        headerTitle="All Departmental Activities"
        showSearch
        searchPlaceholder="Search here.."
        searchValue={search}
        onSearch={(e) => {
          setSearch(e.target.value);
          setLazyParams((prev) => ({ ...prev, page: 1, first: 0 }));
        }}
      />
    </div>
  );
}
