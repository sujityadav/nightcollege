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
      
      const res = await axios.get(`/api/events/getbyId`, {
        params:{id:id},
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const event = res.data.data;
      reset({
        title: event[0]?.Eventdata?.data?.title,
        smallDescription: event[0]?.Eventdata?.data?.smallDescription,
        largeDescription: event[0]?.Eventdata?.data?.largeDescription,
        category: event[0]?.Eventdata?.data?.category,
        location: event[0]?.Eventdata?.data?.location,
      });
      setEditorContent(event[0]?.Eventdata?.data?.largeDescription);
      setFromDate(new Date(event[0]?.Eventdata?.data?.fromDate));
      setToDate(new Date(event[0]?.Eventdata?.data?.toDate));
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
      const url = eventId ? `/api/events/${eventId}` : `/api/events`;
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
        router.push("/admin/events");
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
          {isUpdateMode ? 'Update Committee' : 'Add Committee'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className='bg-white card-shadow p-[25px]'>
          <div className='px-[250px] space-y-3'>

            <div className='flex flex-col gap-1'>
              <label>Committee Title</label>
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
              <Link href="/admin/events" className='cancelbtn px-4 py-2'>Cancel</Link>
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
