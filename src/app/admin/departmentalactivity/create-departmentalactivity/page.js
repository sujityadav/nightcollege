'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import Image from 'next/image';
import TextEditor from '@/app/components/common/editor';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export default function AddEvents() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [depatmentId, setDepatmentId] = useState(null);
  const [SubdepatmentId, setSubdepatmentId] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const comityId = searchParams.get('id');
  const subDepartmentId = searchParams.get('subDepartmentId');
  const isEditMode = Boolean(comityId);
  const activityListUrl = `/admin/departmentalactivity?subDepartmentId=${subDepartmentId}`;

  const subjectsListUrl = depatmentId ? `/admin/subjects?depatmentId=${depatmentId}` : null;
  const subPointsListUrl =
    SubdepatmentId && depatmentId
      ? `/admin/sub-points?SubdepatmentId=${SubdepatmentId}&depatmentId=${depatmentId}`
      : SubdepatmentId
        ? `/admin/sub-points?SubdepatmentId=${SubdepatmentId}`
        : null;

  usePageBreadcrumbs({
    pageTitle: isEditMode ? 'Update Departmental Activity' : 'Add Departmental Activity',
    breadcrumbs: [
      { label: 'All Departments', href: '/admin/all-departments' },
      ...(subjectsListUrl ? [{ label: 'Subjects', href: subjectsListUrl }] : []),
      ...(subPointsListUrl ? [{ label: 'Sub Points', href: subPointsListUrl }] : []),
      { label: 'Departmental Activity', href: activityListUrl },
      {
        label: isEditMode ? 'Update Departmental Activity' : 'Add Departmental Activity',
        isCurrent: true,
      },
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

  // Sync editor content manually
  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('largeDescription', value);
  };

  useEffect(() => {
    if (!comityId) return;
    fetchDepartmentsData(comityId);
  }, [comityId]);

  const fetchDepartmentsData = async (id) => {
    try {
      setLoading(true);
      
      const res = await axios.get(`/api/departmentalactivity/getbyId`, {
        params:{id:id},
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const event = res.data.data;
      reset({
        title: event[0]?.DepartmentlActivityData?.data?.title,
        smallDescription: event[0]?.DepartmentlActivityData?.data?.smallDescription,
        largeDescription: event[0]?.DepartmentlActivityData?.data?.largeDescription,
      });
      setEditorContent(event[0]?.DepartmentlActivityData?.data?.largeDescription);
      
    } catch (err) {
      console.error('Failed to fetch event:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {

    formData.fromDate = fromDate;
    formData.toDate = toDate;
    formData.largeDescription = editorContent;
    formData.subDepartmentId = searchParams.get('subDepartmentId');

    const payload = {
      data: formData,
      ...(comityId && { _id: comityId }),
    };

    try {
      const url = comityId ? `/api/departmentalactivity/${comityId}` : `/api/departmentalactivity`;
      const method = comityId ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response?.data?.success) {
        toast.current.show({
          severity: 'success',
          summary: comityId ? 'Updated' : 'Saved',
          detail: `Content ${comityId ? 'updated' : 'saved'} successfully ✅`,
          life: 3000,
        });
        router.push(activityListUrl);
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    }
  };

  return (
    <div className="flex w-full">
      <Toast ref={toast} />
      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <h2 className='text-[#19212A] text-[22px] font-[700] mb-3'>
          {isEditMode ? 'Update Departmental Activity' : 'Add Departmental Activity'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className='bg-white card-shadow p-[25px]'>
          <div className='px-[250px] space-y-3'>

            <div className='flex flex-col gap-1'>
              <label>Department Title</label>
              <InputText {...register('title', { required: true })} placeholder="Enter your title" />
              {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className='flex flex-col gap-1'>
              <label>Small Description</label>
              <InputText {...register('smallDescription', { required: true })} placeholder="Enter short description" />
              {errors.smallDescription && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className='flex flex-col gap-1'>
              <label>Large Description</label>
              <TextEditor value={editorContent} setEditorContent={setEditorContent} onChange={handleEditorChange} />
              <input type="hidden" {...register('largeDescription', { required: true })} />
              {errors.largeDescription && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

           

            <div className='mt-6 flex justify-center gap-6'>
              <Link href={activityListUrl} className='cancelbtn px-4 py-2'>Cancel</Link>
              <Button
                type='submit'
                className='text-white bg-primarycolor border-[#af251c] px-4 py-2 rounded-none'
                loading={loading}
              >
                {isEditMode ? 'Update' : 'Save'}
              </Button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
