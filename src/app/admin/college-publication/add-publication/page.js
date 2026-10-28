'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import TextEditor from '@/app/components/common/editor';
import MediaUpload, {
  DEFAULT_MAX_MEDIA_SIZE_MB,
  detectMediaType,
  uploadMediaAttachments,
} from '@/app/components/common/MediaUpload';
import { normalizePublicationAttachments } from '@/app/lib/collegePublicationData';

function formatMasterYearOption(year) {
  return `${year.fromYear} – ${year.toYear}`;
}

export default function AddPublication() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [description, setDescription] = useState('');
  const [masterYearId, setMasterYearId] = useState('');
  const [yearOptions, setYearOptions] = useState([]);
  const [yearError, setYearError] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const publicationId = searchParams.get('id');
  const isUpdateMode = Boolean(publicationId);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const response = await axios.get('/api/master-years', { params: { page: 1, limit: 200 } });
        const activeYears = (response.data.data || []).filter((year) => year.status !== false);
        setYearOptions(
          activeYears.map((year) => ({
            label: formatMasterYearOption(year),
            value: year._id,
          }))
        );
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load master years',
          life: 3000,
        });
      }
    };
    loadYears();
  }, []);

  useEffect(() => {
    if (!publicationId) return;
    const loadPublication = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/college-publication/${publicationId}`);
        const publication = response.data?.data?.PublicationData?.data;
        if (!publication) return;

        reset({
          title: publication.title || '',
          description: publication.description || '',
          sortOrder: publication.sortOrder ?? '',
        });
        setDescription(publication.description || '');
        setMasterYearId(publication.masterYearId || '');
        setYearError('');

        const attachments = normalizePublicationAttachments(publication);
        setMediaItems(
          attachments.map((att, index) => ({
            id: `existing-${index}-${att.url}`,
            previewUrl: att.url,
            file: null,
            mediaType: att.mediaType || detectMediaType(att.url, { allowAllFiles: true }),
            fileName: att.fileName || '',
          }))
        );
        setMediaError('');
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Unable to load publication',
          life: 3000,
        });
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

  const onSubmit = async (formData) => {
    if (!masterYearId) {
      setYearError('Year is required');
      return;
    }
    setYearError('');

    if (!mediaItems.length) {
      setMediaError('At least one file is required');
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please upload at least one file',
        life: 3000,
      });
      return;
    }

    const sortOrder = Number(formData.sortOrder);
    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Enter a valid sort order',
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const attachments = await uploadMediaAttachments(mediaItems, { allowAllFiles: true });
      const payload = {
        data: {
          title: formData.title,
          description,
          masterYearId,
          sortOrder,
          attachments,
        },
      };
      const response = publicationId
        ? await axios.put(`/api/college-publication/${publicationId}`, payload)
        : await axios.post('/api/college-publication', payload);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Unable to save publication');
      }
      toast.current?.show({
        severity: 'success',
        summary: 'Saved',
        detail: `Publication ${isUpdateMode ? 'updated' : 'added'} successfully`,
        life: 2000,
      });
      router.push('/admin/college-publication');
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Unable to save publication',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-[20px] xl:p-[25px]">
      <Toast ref={toast} />
      <ConfirmDialog />
      <h2 className="mb-3 text-[22px] font-[700] text-[#19212A]">
        {isUpdateMode ? 'Update College Publication' : 'Add College Publication'}
      </h2>
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

          <div className="flex flex-col gap-1">
            <label>Year</label>
            <Dropdown
              value={masterYearId}
              onChange={(e) => {
                setMasterYearId(e.value);
                setYearError('');
              }}
              options={yearOptions}
              placeholder="Select year"
              className="w-full"
            />
            {yearError && <span className="text-sm text-red-500">{yearError}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="sortOrder">Sort Order</label>
            <InputText
              id="sortOrder"
              type="number"
              min="0"
              {...register('sortOrder', { required: 'Sort order is required' })}
              placeholder="0"
            />
            {errors.sortOrder && <span className="text-sm text-red-500">{errors.sortOrder.message}</span>}
          </div>

          <MediaUpload
            allowAllFiles
            multiple
            required
            label="File Upload"
            maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB}
            items={mediaItems}
            error={mediaError}
            onItemsChange={(items) => {
              setMediaItems(items);
              setMediaError('');
            }}
            onClear={() => {
              setMediaItems([]);
              setMediaError('');
            }}
            onError={(message) => {
              setMediaError(message);
              toast.current?.show({ severity: 'warn', summary: 'Upload', detail: message, life: 3000 });
            }}
          />

          <div className="mt-6 flex justify-center gap-6">
            <Link href="/admin/college-publication" className="cancelbtn px-4 py-2">Cancel</Link>
            <Button type="submit" loading={loading} className="border-[#af251c] bg-primarycolor px-4 py-2 text-white">
              {isUpdateMode ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
