'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import MediaUpload, { DEFAULT_MAX_MEDIA_SIZE_MB, uploadMediaFile } from '@/app/components/common/MediaUpload';

export default function AddPlacementPartner() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const router = useRouter();
  const partnerId = useSearchParams().get('id');
  const isUpdateMode = Boolean(partnerId);

  useEffect(() => {
    if (!partnerId) return;
    const loadPartner = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/placement-partners/${partnerId}`);
        const partner = response.data?.data;
        if (!partner) throw new Error();
        reset({ title: partner.title || '', sortNo: partner.sortNo ?? '' });
        setPreview(partner.image || '');
      } catch {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Unable to load placement partner', life: 3000 });
      } finally { setLoading(false); }
    };
    loadPartner();
  }, [partnerId, reset]);

  const onSubmit = async ({ title, sortNo }) => {
    try {
      setLoading(true);
      const image = await uploadMediaFile(mediaFile, preview);
      if (!image) { setMediaError('Image is required'); return; }
      const payload = { title, image, sortNo: Number(sortNo) };
      const response = partnerId ? await axios.put(`/api/placement-partners/${partnerId}`, payload) : await axios.post('/api/placement-partners', payload);
      if (!response.data?.success) throw new Error(response.data?.message || 'Unable to save placement partner');
      router.push('/admin/placement-partners');
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Unable to save placement partner', life: 3000 });
    } finally { setLoading(false); }
  };

  return <div className="w-full p-[20px] xl:p-[25px]">
    <Toast ref={toast} />
    <h2 className="mb-3 text-[22px] font-[700] text-[#19212A]">{isUpdateMode ? 'Update Placement Partner' : 'Add Placement Partner'}</h2>
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-[25px] card-shadow">
      <div className="space-y-4 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[250px]">
        <div className="flex flex-col gap-1">
          <label htmlFor="title">Title</label>
          <InputText id="title" {...register('title', { required: 'Title is required' })} placeholder="Enter title" />
          {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="sortNo">Sort Number</label>
          <InputText id="sortNo" type="number" min="0" {...register('sortNo', { required: 'Sort number is required', min: { value: 0, message: 'Sort number cannot be negative' } })} placeholder="Enter sort number" />
          {errors.sortNo && <span className="text-sm text-red-500">{errors.sortNo.message}</span>}
        </div>
        <MediaUpload label="Image" allowVideo={false} maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB} previewUrl={preview} mediaType="Photo" error={mediaError}
          onChange={({ file, previewUrl }) => { setMediaFile(file); setPreview(previewUrl); setMediaError(''); }}
          onClear={() => { setMediaFile(null); setPreview(''); setMediaError(''); }}
          onError={(message) => { setMediaError(message); toast.current?.show({ severity: 'warn', summary: 'Upload', detail: message, life: 3000 }); }} />
        <div className="mt-6 flex justify-center gap-6">
          <Link href="/admin/placement-partners" className="cancelbtn px-4 py-2">Cancel</Link>
          <Button type="submit" loading={loading} className="border-[#af251c] bg-primarycolor px-4 py-2 text-white">{isUpdateMode ? 'Update' : 'Save'}</Button>
        </div>
      </div>
    </form>
  </div>;
}
