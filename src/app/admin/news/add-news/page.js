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

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export default function AddEvents() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id'); // <-- read id from query

  // Sync editor content manually
  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('largeDescription', value);
  };

  // Fetch data if in update mode
  useEffect(() => {
    if (eventId) {
      setIsUpdateMode(true);
      fetchEventData(eventId);
    }
  }, [eventId]);

  const fetchEventData = async (id) => {
    try {
      setLoading(true);
      
      const res = await axios.get(`/api/news/getbyId`, {
        params:{id:id},
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const event = res.data.data;
      reset({
        title: event[0]?.Newsdata?.data?.title,
        smallDescription: event[0]?.Newsdata?.data?.smallDescription,
        largeDescription: event[0]?.Newsdata?.data?.largeDescription,
        category: event[0]?.Newsdata?.data?.category,
        location: event[0]?.Newsdata?.data?.location,
      });
      setEditorContent(event[0]?.Newsdata?.data?.largeDescription);
      setFromDate(new Date(event[0]?.Newsdata?.data?.fromDate));
      setToDate(new Date(event[0]?.Newsdata?.data?.toDate));
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

    const payload = {
      data: formData,
      ...(eventId && { _id: eventId }),
    };

    try {
      const url = eventId ? `/api/news/${eventId}` : `/api/news`;
      const method = eventId ? 'put' : 'post';

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
          summary: eventId ? 'Updated' : 'Saved',
          detail: `Content ${eventId ? 'updated' : 'saved'} successfully ✅`,
          life: 3000,
        });
        router.push("/admin/news");
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
          {isUpdateMode ? 'Update Event' : 'Add Event'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className='bg-white card-shadow p-[25px]'>
          <div className='px-[250px] space-y-3'>

            <div className='flex flex-col gap-1'>
              <label>Event Title</label>
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

            <div className='flex gap-5'>
              <div className='flex flex-col gap-1'>
                <label>From (Date)</label>
                <Calendar value={fromDate} onChange={(e) => setFromDate(e.value)} showIcon />
              </div>
              <div className='flex flex-col gap-1'>
                <label>To (Date)</label>
                <Calendar value={toDate} onChange={(e) => setToDate(e.value)} showIcon />
              </div>
              <div className='flex flex-col gap-1 w-full'>
                <label>Category</label>
                <InputText {...register('category', { required: true })} placeholder="Enter category" />
                {errors.category && <span className="text-red-500 text-sm">This field is required</span>}
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <label>Location</label>
              <InputText {...register('location', { required: true })} placeholder="Enter location" />
              {errors.location && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className='flex flex-col gap-1'>
              <label>Photo Upload</label>
              <div className="flex border-2 border-dashed p-4 justify-center group relative cursor-pointer bg-[#fffef5]">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="text-center">
                  <Image src="/images/admin/svg/upload.svg" width={40} height={40} alt='Upload' />
                  <p className="text-[#6C768B]"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                </div>
              </div>
            </div>

            <div className='mt-6 flex justify-center gap-6'>
              <Link href="/admin/news" className='cancelbtn px-4 py-2'>Cancel</Link>
              <Button
                type='submit'
                className='text-white bg-primarycolor border-[#af251c] px-4 py-2'
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
