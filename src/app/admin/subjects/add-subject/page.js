'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import TextEditor from '@/app/components/common/editor';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export default function AddSubject() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('id');
  const depatmentId = searchParams.get('depatmentId');
  const isEditMode = Boolean(subjectId);

  const subjectsListUrl = `/admin/subjects?depatmentId=${depatmentId}`;

  usePageBreadcrumbs({
    pageTitle: isEditMode ? 'Update Subject' : 'Add Subject',
    breadcrumbs: [
      { label: 'All Departments', href: '/admin/all-departments' },
      { label: 'Subjects', href: subjectsListUrl },
      { label: isEditMode ? 'Update Subject' : 'Add Subject', isCurrent: true },
    ],
  });

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('largeDescription', value);
  };

  useEffect(() => {
    if (!subjectId) return;

    const fetchSubjectData = async (id) => {
      try {
        setLoading(true);
        const res = await axios.get('/api/innerdepartments/getbyId', {
          params: { id },
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const item = res.data.data;
        reset({
          title: item[0]?.InnerDepartmentsData?.data?.title,
          smallDescription: item[0]?.InnerDepartmentsData?.data?.smallDescription,
          largeDescription: item[0]?.InnerDepartmentsData?.data?.largeDescription,
          sortOrder: item[0]?.InnerDepartmentsData?.data?.sortOrder ?? 0,
        });
        setEditorContent(item[0]?.InnerDepartmentsData?.data?.largeDescription);
      } catch (err) {
        console.error('Failed to fetch subject:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectData(subjectId);
  }, [subjectId, reset, user.token]);

  const onSubmit = async (formData) => {
    formData.largeDescription = editorContent;
    formData.depatmentId = depatmentId;
    formData.sortOrder = Number(formData.sortOrder);

    const payload = {
      data: formData,
      ...(subjectId && { _id: subjectId }),
    };

    try {
      const url = subjectId ? `/api/innerdepartments/${subjectId}` : '/api/innerdepartments';
      const method = subjectId ? 'put' : 'post';

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
          summary: subjectId ? 'Updated' : 'Saved',
          detail: `Subject ${subjectId ? 'updated' : 'saved'} successfully`,
          life: 3000,
        });
        router.push(subjectsListUrl);
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
          <div className="px-[250px] space-y-3">
            <div className="flex flex-col gap-1">
              <label>Subject Title</label>
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
              <Link href={subjectsListUrl} className="cancelbtn px-4 py-2">
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
