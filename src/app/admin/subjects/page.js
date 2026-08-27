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

export default function SubjectsList() {
  const searchParams = useSearchParams();
  const depatmentId = searchParams.get('depatmentId');

  usePageBreadcrumbs({
    pageTitle: 'Subjects',
    breadcrumbs: [
      { label: 'All Departments', href: '/admin/all-departments' },
      { label: 'Subjects', isCurrent: true },
    ],
  });

  const [subjectsData, setSubjectsData] = useState([]);
  const [search, setSearch] = useState('');
  const toast = useRef(null);

  useEffect(() => {
    const fetchSubjectsList = async () => {
      try {
        const response = await axios.get('/api/innerdepartments', {
          params: { departmentId: depatmentId },
        });
        if (response?.data?.success) {
          setSubjectsData(response?.data?.data);
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      }
    };
    fetchSubjectsList();
  }, [depatmentId]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return subjectsData;
    const query = search.toLowerCase();
    return subjectsData.filter((item) => {
      const title = item?.InnerDepartmentsData?.data?.title?.toLowerCase() || '';
      const description = item?.InnerDepartmentsData?.data?.smallDescription?.toLowerCase() || '';
      return title.includes(query) || description.includes(query);
    });
  }, [subjectsData, search]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/innerdepartments/${id}`);
      if (response?.data?.success) {
        setSubjectsData((current) => current.filter((item) => item._id !== id));
        toast.current.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Subject deleted successfully',
          life: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete subject:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete subject',
        life: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    confirmDialog({
      message: 'Are you sure you want to delete this subject?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(id),
    });
  };

  const actionTemplate = (rowData) => (
    <div className="flex justify-center items-center gap-4">
      <Link
        href={`/admin/subjects/add-subject?id=${rowData?._id}&depatmentId=${depatmentId}`}
        className="leading-none"
      >
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
      field: 'InnerDepartmentsData.data.title',
      header: 'Title',
      sortable: true,
      body: (rowData) => (
        <a
          href={`/admin/sub-points?SubdepatmentId=${rowData._id}&depatmentId=${depatmentId}`}
          style={{ color: 'blue', textDecoration: 'underline' }}
        >
          {rowData.InnerDepartmentsData.data.title}
        </a>
      ),
      style: { minWidth: '10rem' },
    },
    {
      field: 'InnerDepartmentsData.data.smallDescription',
      header: 'Description',
      style: { minWidth: '12rem' },
    },
    {
      header: 'Sort Order',
      body: (rowData) => rowData?.InnerDepartmentsData?.data?.sortOrder ?? '-',
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
      align: 'center',
      style: {
        minWidth: '5rem',
        background: '#fbf7dc',
        boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="p-[20px] xl:p-[25px] w-full">
        <div className="flex justify-between mb-5">
          <h2 className="text-[#19212A] text-[14px] xl:text-[22px] font-[700] m-0">Subjects</h2>
          <Link
            href={`/admin/subjects/add-subject?depatmentId=${depatmentId}`}
            className="text-white border bg-primarycolor border-[#af251c] px-4 py-2 flex gap-2 items-center"
          >
            <i className="pi pi-plus text-[14px]" /> Add Subject
          </Link>
        </div>

        <CommonDataTable
          value={filteredData}
          columns={columns}
          lazy={false}
          totalRecords={filteredData.length}
          headerTitle={
            <div className="flex items-center gap-4">
              <span>All Subjects</span>
              <span className="bg-[#F6F7F9] px-3 py-1 text-[#6C768B] text-[12px] rounded-full font-medium">
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
