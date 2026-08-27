'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';
import CommonDataTable from '@/app/components/common/DataTable';

export default function SubPointsList() {
  const [subPointsData, setSubPointsData] = useState([]);
  const [search, setSearch] = useState('');
  const toast = useRef(null);
  const searchParams = useSearchParams();
  const SubdepatmentId = searchParams.get('SubdepatmentId');
  const [depatmentId, setDepatmentId] = useState(searchParams.get('depatmentId'));

  const subjectsListUrl = depatmentId ? `/admin/subjects?depatmentId=${depatmentId}` : null;

  usePageBreadcrumbs({
    pageTitle: 'Sub Points',
    breadcrumbs: [
      { label: 'All Departments', href: '/admin/all-departments' },
      ...(subjectsListUrl ? [{ label: 'Subjects', href: subjectsListUrl }] : []),
      { label: 'Sub Points', isCurrent: true },
    ],
  });

  useEffect(() => {
    if (depatmentId || !SubdepatmentId) return;

    const fetchParentDepartmentId = async () => {
      try {
        const response = await axios.get('/api/innerdepartments/getbyId', {
          params: { id: SubdepatmentId },
        });
        const parentId = response.data?.data?.[0]?.InnerDepartmentsData?.data?.depatmentId;
        if (parentId) setDepatmentId(parentId);
      } catch (error) {
        console.error('Failed to fetch parent department:', error);
      }
    };

    fetchParentDepartmentId();
  }, [SubdepatmentId, depatmentId]);

  useEffect(() => {
    const fetchSubPointsList = async () => {
      const response = await axios.get('/api/subdepartment', {
        params: { SubdepatmentId },
      });
      if (response?.data?.success) {
        setSubPointsData(response?.data?.data);
      }
    };
    fetchSubPointsList();
  }, [SubdepatmentId]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return subPointsData;
    const query = search.toLowerCase();
    return subPointsData.filter((item) => {
      const title = item?.SubDepartmentsData?.data?.title?.toLowerCase() || '';
      const description = item?.SubDepartmentsData?.data?.smallDescription?.toLowerCase() || '';
      return title.includes(query) || description.includes(query);
    });
  }, [subPointsData, search]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/subdepartment/${id}`);
      if (response?.data?.success) {
        setSubPointsData(subPointsData.filter((item) => item._id !== id));
        toast.current.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Sub point deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete sub point:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete sub point',
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this sub point?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => handleDelete(id),
    });
  };

  const buildAddSubPointUrl = (subPointId) => {
    const params = new URLSearchParams({ SubdepatmentId });
    if (depatmentId) params.set('depatmentId', depatmentId);
    if (subPointId) params.set('id', subPointId);
    return `/admin/sub-points/add-sub-point?${params.toString()}`;
  };

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link href={buildAddSubPointUrl(rowData?._id)} className="leading-none">
        <i className="pi pi-pen-to-square text-[18px]" />
      </Link>
      <button
        type="button"
        onClick={() => confirmDelete(rowData?._id)}
        className="leading-none bg-transparent border-0 cursor-pointer text-red-500"
      >
        <i className="pi pi-trash text-[18px]" />
      </button>
    </div>
  );

  const formatDate = (value) => (value ? format(new Date(value), 'dd MMM yyyy') : '-');

  const columns = [
    {
      field: 'SubDepartmentsData.data.title',
      header: 'Title',
      sortable: true,
      body: (rowData) => {
        const title = rowData?.SubDepartmentsData?.data?.title || '-';
        const hasActivities = rowData?.SubDepartmentsData?.data?.hasActivities;

        return hasActivities ? (
          <a
            href={`/admin/departmentalactivity?subDepartmentId=${rowData._id}`}
            style={{ color: 'blue', textDecoration: 'underline' }}
          >
            {title}
          </a>
        ) : (
          <span>{title}</span>
        );
      },
      style: { minWidth: '10rem' },
    },
    {
      field: 'SubDepartmentsData.data.smallDescription',
      header: 'Description',
      style: { minWidth: '12rem' },
    },
    {
      header: 'Sort Order',
      body: (rowData) => rowData?.SubDepartmentsData?.data?.sortOrder ?? '-',
      style: { minWidth: '6rem' },
    },
    {
      header: 'Created At',
      body: (rowData) => formatDate(rowData?.createdAt),
      style: { minWidth: '8rem' },
    },
    {
      header: 'Action',
      body: actionTemplate,
      className: 'action-shadow-table',
      align: 'center',
      style: { minWidth: '4rem', background: '#fbf7dc', zIndex: 1 },
    },
  ];

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-[20px] xl:p-[25px] w-full">
        <div className="flex justify-between mb-5">
          <h2 className="text-[#19212A] text-[14px] xl:text-[22px] font-[700] m-0">Sub Points</h2>
          <Link
            href={buildAddSubPointUrl()}
            className="text-white border bg-primarycolor border-[#af251c] px-[14px] py-[8px] leading-[100%] rounded-none p-button-raised flex gap-2 items-center"
          >
            <i className="pi pi-plus text-[14px]" /> Add Sub Point
          </Link>
        </div>

        <CommonDataTable
          value={filteredData}
          columns={columns}
          lazy={false}
          totalRecords={filteredData.length}
          headerTitle={
            <div className="flex items-center gap-4">
              <span>All Sub Points</span>
              <span className="bg-[#F6F7F9] px-[12px] py-[4px] text-[#6C768B] text-[12px] rounded-[16px] font-medium">
                {filteredData.length} Records
              </span>
            </div>
          }
          showSearch
          searchPlaceholder="Search here.."
          searchValue={search}
          onSearch={(event) => setSearch(event.target.value)}
        />
      </div>
    </div>
  );
}
