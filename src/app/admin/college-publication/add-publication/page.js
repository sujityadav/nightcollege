'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import TextEditor from '@/app/components/common/editor';

export default function AddPublication() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
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

  const onPhotoChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      toast.current?.show({ severity: 'warn', summary: 'Invalid file', detail: 'Please choose an image file.', life: 3000 });
      return;
    }
    setPhoto(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const removePhoto = () => confirmDialog({
    header: 'Remove Photo',
    message: 'Remove this photo from the publication? Save the form to keep this change.',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Remove',
    rejectLabel: 'Cancel',
    acceptClassName: 'p-button-danger',
    accept: () => {
      setPhoto(null);
      setPreview('');
      toast.current?.show({ severity: 'info', summary: 'Photo removed', detail: 'Save the form to update the publication.', life: 2500 });
    },
  });

  const uploadPhoto = async () => {
    if (!(photo instanceof File)) return preview;
    const formData = new FormData();
    formData.append('photo', photo);
    const response = await axios.post('/api/upload', formData);
    const imageUrl = response.data?.result?.[0]?.url;
    if (!imageUrl) throw new Error('Photo upload failed');
    return imageUrl;
  };

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const photoUrl = await uploadPhoto();
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

          <div className="flex flex-col gap-2">
            <label>Photo Upload</label>
            <div className="relative flex cursor-pointer justify-center border-2 border-dashed bg-[#fffef5] p-4">
              <input type="file" accept="image/*" onChange={onPhotoChange} className="absolute inset-0 cursor-pointer opacity-0" />
              <div className="text-center">
                <Image src="/images/admin/svg/upload.svg" width={40} height={40} alt="Upload" />
                <p className="text-[#6C768B]"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              </div>
            </div>
            {preview && <div className="relative w-fit"><img src={preview} alt="Publication preview" className="h-32 w-32 rounded object-cover" /><button type="button" onClick={removePhoto} className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-0 bg-red-600 text-white" aria-label="Remove photo"><i className="pi pi-times" /></button></div>}
          </div>

          <div className="mt-6 flex justify-center gap-6">
            <Link href="/admin/college-publication" className="cancelbtn px-4 py-2">Cancel</Link>
            <Button type="submit" loading={loading} className="border-[#af251c] bg-primarycolor px-4 py-2 text-white">{isUpdateMode ? 'Update' : 'Save'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
