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

export default function AddAlumni() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [batchYear, setBatchYear] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const alumniId = searchParams.get('id'); // <-- read id from query

  // Sync editor content manually
  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('bio', value);
  };

  // Fetch data if in update mode
  useEffect(() => {
    if (alumniId) {
      setIsUpdateMode(true);
      fetchAlumniData(alumniId);
    }
  }, [alumniId]);

  const fetchAlumniData = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/alumni/getbyId`, {
        params: { id },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const alumni = res.data.data[0].AlumniData?.data;
      reset({
        fullName: alumni?.fullName,
        course: alumni?.course,
        position: alumni?.position,
        company: alumni?.company,
        bio: alumni?.bio,
      });
      setEditorContent(alumni?.bio);
      setBatchYear(new Date(alumni?.batchYear));
      setProfilePhoto(alumni?.profilePhoto);
    } catch (err) {
      console.error('Failed to fetch alumni:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    formData.batchYear = batchYear;
    formData.bio = editorContent;
    formData.profilePhoto = profilePhoto;

    const payload = {
      data: formData,
      ...(alumniId && { _id: alumniId }),
    };

    try {
      const url = alumniId ? `/api/alumni/${alumniId}` : `/api/alumni`;
      const method = alumniId ? 'put' : 'post';

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
          summary: alumniId ? 'Updated' : 'Saved',
          detail: `Alumni ${alumniId ? 'updated' : 'added'} successfully ✅`,
          life: 3000,
        });
        router.push("/admin/alumni");
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
  };

  return (
    <div className="flex w-full">
      <Toast ref={toast} />
      <div className='p-[20px] xl:p-[25px] w-full'>
        <h2 className='text-[#19212A] text-[22px] font-[700] mb-3'>
          {isUpdateMode ? 'Update Alumni' : 'Add Alumni'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className='bg-white card-shadow p-[25px]'>
          <div className='px-[250px] space-y-3'>

            <div className='flex flex-col gap-1'>
              <label>Full Name</label>
              <InputText {...register('fullName', { required: true })} placeholder="Enter full name" />
              {errors.fullName && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className='flex gap-5'>
              <div className='flex flex-col gap-1 w-1/2'>
                <label>Batch / Passing Year</label>
                <Calendar value={batchYear} onChange={(e) => setBatchYear(e.value)} view="year" dateFormat="yy" showIcon />
              </div>
              <div className='flex flex-col gap-1 w-1/2'>
                <label>Course / Department</label>
                <InputText {...register('course', { required: true })} placeholder="Enter course" />
                {errors.course && <span className="text-red-500 text-sm">This field is required</span>}
              </div>
            </div>

            <div className='flex gap-5'>
              <div className='flex flex-col gap-1 w-1/2'>
                <label>Current Position</label>
                <InputText {...register('position')} placeholder="Enter job title" />
              </div>
              <div className='flex flex-col gap-1 w-1/2'>
                <label>Company / Organization</label>
                <InputText {...register('company')} placeholder="Enter company" />
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <label>Bio / Achievements</label>
              <TextEditor value={editorContent} setEditorContent={setEditorContent} onChange={handleEditorChange} />
              <input type="hidden" {...register('bio', { required: true })} />
              {errors.bio && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className='flex flex-col gap-1'>
              <label>Profile Photo</label>
              <div className="flex border-2 border-dashed p-4 justify-center group relative cursor-pointer bg-[#fffef5]">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="text-center">
                  <Image src="/images/admin/svg/upload.svg" width={40} height={40} alt='Upload' />
                  <p className="text-[#6C768B]"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                </div>
              </div>
              {profilePhoto && <p className="text-sm text-green-600 mt-1">Selected: {profilePhoto.name}</p>}
            </div>

            <div className='mt-6 flex justify-center gap-6'>
              <Link href="/admin/alumni" className='cancelbtn px-4 py-2'>Cancel</Link>
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
