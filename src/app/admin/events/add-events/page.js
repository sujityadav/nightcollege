'use client';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import Link from 'next/link';
import Image from 'next/image';
import TextEditor from '@/app/components/common/editor';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';

export default function AddEvents() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [editorContent, setEditorContent] = useState('');
    const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
const router = useRouter();
  // Sync editor content manually
  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('largeDescription', value);
  };

  const onSubmit = async(data) => {
    data.fromDate = fromDate;
    data.toDate = toDate;
     const payload = {
    data,
    // ...(!!_id && { _id }), // send ID if updating
  };
    const response = await axios.post('/api/events', payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    },
  });
  if(response?.data?.success){
       toast.current.show({
        severity: 'success',
        summary:  'Saved',
        detail: `Content  successfully ✅`,
        life: 3000,
      });
    router.push("/admin/events");
  }
    // 👉 You can now POST to your backend API here
  };

  return (
    <div className="flex w-full">
      <Toast ref={toast} />
      <div className='p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full'>
        <h2 className='text-[#19212A] text-[22px] font-[700] mb-3'>Add Events</h2>

        <form onSubmit={handleSubmit(onSubmit)} className='bg-white card-shadow p-[25px]'>
          <div className='px-[250px] space-y-3'>

            {/* Event Title */}
            <div className='flex flex-col gap-1'>
              <label>Event Title</label>
              <InputText {...register('title', { required: true })} placeholder="Enter your title" />
              {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            {/* Small Description */}
            <div className='flex flex-col gap-1'>
              <label>Small Description</label>
              <InputText {...register('smallDescription', { required: true })} placeholder="Enter short description" />
              {errors.smallDescription && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            {/* Large Description */}
            <div className='flex flex-col gap-1'>
              <label>Large Description</label>
              <TextEditor value={editorContent} setEditorContent={setEditorContent} onChange={handleEditorChange} />
              {/* Hidden input to register editor content */}
              <input type="hidden" {...register('largeDescription', { required: true })} />
              {errors.largeDescription && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            {/* Dates and Category */}
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

            {/* Location */}
            <div className='flex flex-col gap-1'>
              <label>Location</label>
              <InputText {...register('location', { required: true })} placeholder="Enter location" />
              {errors.location && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            {/* Photo Upload (optional example, not hooked) */}
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

            {/* Save / Cancel Buttons */}
            <div className='mt-6 flex justify-center gap-6'>
              <Link href='' className='cancelbtn px-4 py-2'>Cancel</Link>
              <Button type='submit' className='text-white bg-primarycolor border-[#af251c] px-4 py-2'>
                Save
              </Button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
