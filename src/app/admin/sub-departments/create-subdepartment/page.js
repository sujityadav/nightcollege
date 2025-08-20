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
import { InputSwitch } from 'primereact/inputswitch'; // ✅ New import
import Link from 'next/link';
import Image from 'next/image';
import TextEditor from '@/app/components/common/editor';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export default function AddSubDepartment() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasActivities, setHasActivities] = useState(false); // ✅ New flag state

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const comityId = searchParams.get('id'); // <-- read id from query

  // Sync editor content manually
  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('largeDescription', value);
  };

  // Fetch data if in update mode
  useEffect(() => {
    if (comityId) {
      setIsUpdateMode(true);
      fetchDepartmentsData(comityId);
    }
  }, [comityId]);

  const fetchDepartmentsData = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/subdepartment/getbyId`, {
        params: { id: id },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const event = res.data.data;
      reset({
        title: event[0]?.subdepartmentData?.data?.title,
        smallDescription: event[0]?.subdepartmentData?.data?.smallDescription,
        largeDescription: event[0]?.subdepartmentData?.data?.largeDescription,
      });
      setEditorContent(event[0]?.subdepartmentData?.data?.largeDescription);

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
    formData.SubdepatmentId = searchParams.get('SubdepatmentId');
    formData.hasActivities = hasActivities; // ✅ include in payload if needed

    const payload = {
      data: formData,
      ...(comityId && { _id: comityId }),
    };

    try {
      const url = comityId ? `/api/subdepartment/${comityId}` : `/api/subdepartment`;
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

        // ✅ Conditional Redirect
        if (hasActivities) {
          router.push(`/admin/departmental-activities?SubdepatmentId=${searchParams.get('SubdepatmentId')}`);
        } else {
          router.push(`/admin/sub-departments?SubdepatmentId=${searchParams.get('SubdepatmentId')}`);
        }
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
          {isUpdateMode ? 'Update DepartMents' : 'Add DepartMents'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className='bg-white card-shadow p-[25px]'>
          <div className='px-[250px] space-y-3'>

            <div className='flex flex-col gap-1'>
              <label>DepartMents Title</label>
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

            {/* ✅ Toggle for Departmental Activities */}
            <div className='flex items-center gap-3 mt-4'>
              <label className='font-medium'>Has Departmental Activities?</label>
              <InputSwitch checked={hasActivities} onChange={(e) => setHasActivities(e.value)} />
            </div>

            <div className='mt-6 flex justify-center gap-6'>
              <Link href="/admin/departments" className='cancelbtn px-4 py-2'>Cancel</Link>
              <Button
                type='submit'
                className='text-white bg-primarycolor border-[#af251c] px-4 py-2 rounded-none'
                loading={loading}
              >
                {isUpdateMode ? 'Update' : 'Save'}
              </Button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
