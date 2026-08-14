'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import TextEditor from '@/app/components/common/editor';
import MediaUpload, { DEFAULT_MAX_MEDIA_SIZE_MB, uploadMediaFile } from '@/app/components/common/MediaUpload';

export default function AddPublication() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const publicationId = searchParams.get('id');
  const isUpdateMode = Boolean(publicationId);

  useEffect(() => {
    if (!publicationId) return;
    const loadPublication = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/college-publication/${publicationId}`);
        const publication = response.data?.data?.PublicationData?.data;
        if (!publication) return;
        reset({ title: publication.title || '', description: publication.description || '' });
        setDescription(publication.description || '');
        setPreview(publication.photo || '');
        setMediaFile(null);
        setMediaError('');
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Unable to load publication', life: 3000 });
      } finally {
        setLoading(false);
      }
    };
    loadPublication();
  }, [publicationId, reset]);

  const onDescriptionChange = (value) => {
    setDescription(value);
    setValue('description', value, { shouldValidate: true });
  };

  const handleMediaChange = ({ file, previewUrl }) => {
    setMediaFile(file);
    setPreview(previewUrl);
    setMediaError('');
  };

  const handleMediaClear = () => {
    setMediaFile(null);
    setPreview('');
    setMediaError('');
  };

  const handleMediaError = (message) => {
    setMediaError(message);
    toast.current?.show({ severity: 'warn', summary: 'Upload', detail: message, life: 3000 });
  };

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const photoUrl = await uploadMediaFile(mediaFile, preview);
      const payload = { data: { title: formData.title, description, photo: photoUrl } };
      const response = publicationId
        ? await axios.put(`/api/college-publication/${publicationId}`, payload)
        : await axios.post('/api/college-publication', payload);
      if (!response.data?.success) throw new Error(response.data?.message || 'Unable to save publication');
      toast.current?.show({ severity: 'success', summary: 'Saved', detail: `Publication ${isUpdateMode ? 'updated' : 'added'} successfully`, life: 2000 });
      router.push('/admin/college-publication');
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Unable to save publication', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-[20px] xl:p-[25px]">
      <Toast ref={toast} />
      <ConfirmDialog />
      <h2 className="mb-3 text-[22px] font-[700] text-[#19212A]">{isUpdateMode ? 'Update College Publication' : 'Add College Publication'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-[25px] card-shadow">
        <div className="space-y-4 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[250px]">
          <div className="flex flex-col gap-1">
            <label htmlFor="title">Title</label>
            <InputText id="title" {...register('title', { required: 'Title is required' })} placeholder="Enter title" />
            {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label>Description</label>
            <TextEditor value={description} setEditorContent={setDescription} onChange={onDescriptionChange} />
            <input type="hidden" {...register('description', { required: 'Description is required' })} />
            {errors.description && <span className="text-sm text-red-500">{errors.description.message}</span>}
          </div>

          <MediaUpload
            allowVideo={false}
            maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB}
            previewUrl={preview}
            mediaType="Photo"
            error={mediaError}
            onChange={handleMediaChange}
            onClear={handleMediaClear}
            onError={handleMediaError}
          />

          <div className="mt-6 flex justify-center gap-6">
            <Link href="/admin/college-publication" className="cancelbtn px-4 py-2">Cancel</Link>
            <Button type="submit" loading={loading} className="border-[#af251c] bg-primarycolor px-4 py-2 text-white">{isUpdateMode ? 'Update' : 'Save'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
