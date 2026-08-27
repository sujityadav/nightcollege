'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputSwitch } from 'primereact/inputswitch';
import Link from 'next/link';
import TextEditor from '@/app/components/common/editor';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

const buildSubPointsUrl = (SubdepatmentId, depatmentId) => {
  const params = new URLSearchParams({ SubdepatmentId });
  if (depatmentId) params.set('depatmentId', depatmentId);
  return `/admin/sub-points?${params.toString()}`;
};

export default function AddSubPoint() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasActivities, setHasActivities] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subPointId = searchParams.get('id');
  const SubdepatmentId = searchParams.get('SubdepatmentId');
  const [depatmentId, setDepatmentId] = useState(searchParams.get('depatmentId'));
  const isEditMode = Boolean(subPointId);

  const subjectsListUrl = depatmentId ? `/admin/subjects?depatmentId=${depatmentId}` : null;
  const subPointsListUrl = buildSubPointsUrl(SubdepatmentId, depatmentId);

  usePageBreadcrumbs({
    pageTitle: isEditMode ? 'Update Sub Point' : 'Add Sub Point',
    breadcrumbs: [
      { label: 'All Departments', href: '/admin/all-departments' },
      ...(subjectsListUrl ? [{ label: 'Subjects', href: subjectsListUrl }] : []),
      { label: 'Sub Points', href: subPointsListUrl },
      { label: isEditMode ? 'Update Sub Point' : 'Add Sub Point', isCurrent: true },
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

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('largeDescription', value);
  };

  useEffect(() => {
    if (!subPointId) return;

    const fetchSubPointData = async (id) => {
      try {
        setLoading(true);
        const res = await axios.get('/api/subdepartment/getbyId', {
          params: { id },
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const item = res.data.data?.[0];
        reset({
          title: item?.SubDepartmentsData?.data?.title,
          smallDescription: item?.SubDepartmentsData?.data?.smallDescription,
          largeDescription: item?.SubDepartmentsData?.data?.largeDescription,
          sortOrder: item?.SubDepartmentsData?.data?.sortOrder ?? 0,
        });
        setEditorContent(item?.SubDepartmentsData?.data?.largeDescription || '');
        setHasActivities(Boolean(item?.SubDepartmentsData?.data?.hasActivities));
      } catch (err) {
        console.error('Failed to fetch sub point:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubPointData(subPointId);
  }, [subPointId, reset, user.token]);

  const onSubmit = async (formData) => {
    formData.largeDescription = editorContent;
    formData.SubdepatmentId = SubdepatmentId;
    formData.hasActivities = hasActivities;
    formData.sortOrder = Number(formData.sortOrder);

    const payload = {
      data: formData,
      ...(subPointId && { _id: subPointId }),
    };

    try {
      const url = subPointId ? `/api/subdepartment/${subPointId}` : '/api/subdepartment';
      const method = subPointId ? 'put' : 'post';

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
          summary: subPointId ? 'Updated' : 'Saved',
          detail: `Sub point ${subPointId ? 'updated' : 'saved'} successfully`,
          life: 3000,
        });

        if (hasActivities) {
          router.push(`/admin/departmentalactivity?subDepartmentId=${subPointId || response.data?.data?._id}`);
        } else {
          router.push(subPointsListUrl);
        }
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    }
  };

  return (
    <div className="flex w-full">
      <Toast ref={toast} />
      <div className="p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white card-shadow p-[25px]">
          <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[250px] space-y-3">
            <div className="flex flex-col gap-1">
              <label>Sub Point Title</label>
              <InputText {...register('title', { required: true })} placeholder="Enter your title" />
              {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label>Small Description</label>
              <InputText {...register('smallDescription', { required: true })} placeholder="Enter short description" />
              {errors.smallDescription && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label>Large Description</label>
              <TextEditor value={editorContent} setEditorContent={setEditorContent} onChange={handleEditorChange} />
              <input type="hidden" {...register('largeDescription', { required: true })} />
              {errors.largeDescription && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <label className="font-medium">Has Departmental Activities?</label>
              <InputSwitch checked={hasActivities} onChange={(e) => setHasActivities(e.value)} />
            </div>

            <div className="flex flex-col gap-1">
              <label>Sort Order <span className="text-red-500">*</span></label>
              <InputText
                type="number"
                min="0"
                {...register('sortOrder', {
                  required: 'Sort order is required',
                  min: { value: 0, message: 'Sort order cannot be negative' },
                })}
                placeholder="Enter sort order"
              />
              {errors.sortOrder && (
                <span className="text-red-500 text-sm">{errors.sortOrder.message || 'This field is required'}</span>
              )}
            </div>

            <div className="mt-6 flex justify-center gap-6">
              <Link href={subPointsListUrl} className="cancelbtn px-4 py-2">
                Cancel
              </Link>
              <Button
                type="submit"
                className="text-white bg-primarycolor border-[#af251c] px-4 py-2 rounded-none"
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
