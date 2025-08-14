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

export default function AddStaff() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [joiningDate, setJoiningDate] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [staffPhoto, setStaffPhoto] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const staffId = searchParams.get('id');

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('details', value);
  };

  useEffect(() => {
    if (staffId) {
      setIsUpdateMode(true);
      fetchStaffData(staffId);
    }
  }, [staffId]);

  const fetchStaffData = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/stafs/getbyId`, {
        params: { id:id },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const staff = res.data.data?.[0]?.StaffData?.data;
      reset({
        name: staff?.name,
        designation: staff?.designation,
        details: staff?.details,
      });
      setEditorContent(staff?.details || '');
      setJoiningDate(staff?.joiningDate ? new Date(staff.joiningDate) : null);
      setStaffPhoto(staff?.photo || null);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setStaffPhoto(file);
    }
  };

  const onSubmit = async (formData) => {
    formData.details = editorContent;
    formData.joiningDate = joiningDate;
    // if (staffPhoto && staffPhoto instanceof File) {
    //   formData.append('photo', staffPhoto);
    // }
      const payload = {
      data: formData,
      ...(staffId && { _id: staffId }),
    };
    // if (staffId) payload.append('_id', staffId);

    try {
      const url = staffId ? `/api/stafs/${staffId}` : `/api/stafs`;
      const method = staffId ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response?.data?.success) {
        toast.current.show({
          severity: 'success',
          summary: staffId ? 'Updated' : 'Saved',
          detail: `Staff ${staffId ? 'updated' : 'added'} successfully ✅`,
          life: 3000,
        });
        router.push("/admin/all-staf");
      }
    } catch (err) {
      console.error('Failed to submit staff:', err);
    }
  };

  return (
    <div className="flex w-full">
      <Toast ref={toast} />
      <div className='p-[20px] xl:p-[25px] w-full'>
        <h2 className='text-[#19212A] text-[22px] font-[700] mb-3'>
          {isUpdateMode ? 'Update Staff' : 'Add Staff'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className='bg-white card-shadow p-[25px]'>
          <div className='px-[250px] space-y-3'>

            <div className='flex flex-col gap-1'>
              <label>Staff Name</label>
              <InputText {...register('name', { required: true })} placeholder="Enter staff name" />
              {errors.name && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className='flex flex-col gap-1'>
              <label>Designation</label>
              <InputText {...register('designation', { required: true })} placeholder="Enter designation" />
              {errors.designation && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className='flex flex-col gap-1'>
              <label>Details / Bio</label>
              <TextEditor value={editorContent} setEditorContent={setEditorContent} onChange={handleEditorChange} />
              <input type="hidden" {...register('details', { required: true })} />
              {errors.details && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className='flex flex-col gap-1'>
              <label>Joining Date</label>
              <Calendar value={joiningDate} onChange={(e) => setJoiningDate(e.value)} showIcon />
            </div>

            <div className='flex flex-col gap-1'>
              <label>Staff Photo</label>
              <div className="flex border-2 border-dashed p-4 justify-center group relative cursor-pointer bg-[#fffef5]">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onFileChange} />
                <div className="text-center">
                  <Image src="/images/admin/svg/upload.svg" width={40} height={40} alt='Upload' />
                  <p className="text-[#6C768B]"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                </div>
              </div>
              {staffPhoto && typeof staffPhoto === 'string' && (
                <img src={staffPhoto} alt="Staff" className="mt-2 w-32 h-32 object-cover border" />
              )}
            </div>

            <div className='mt-6 flex justify-center gap-6'>
              <Link href="/admin/stafs" className='cancelbtn px-4 py-2'>Cancel</Link>
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
