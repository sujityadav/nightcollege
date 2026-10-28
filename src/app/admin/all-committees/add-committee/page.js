'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import TextEditor from '@/app/components/common/editor';
import MediaUpload, {
  DEFAULT_MAX_MEDIA_SIZE_MB,
  detectMediaType,
  uploadMediaFile,
} from '@/app/components/common/MediaUpload';

function formatMasterYearOption(year) {
  return `${year.fromYear} – ${year.toYear}`;
}

export default function AddCommitteePage() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [editorContent, setEditorContent] = useState('');
  const [masterYearId, setMasterYearId] = useState('');
  const [yearOptions, setYearOptions] = useState([]);
  const [yearError, setYearError] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [mediaType, setMediaType] = useState('File');
  const [mediaError, setMediaError] = useState('');
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const committeeId = searchParams.get('id');
  const isUpdateMode = Boolean(committeeId);

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('largeDescription', value);
  };

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
    if (!committeeId) return;

    const fetchCommittee = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/commities/getbyId', {
          params: { id: committeeId },
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        const event = res.data.data?.[0];
        const data = event?.CommitiesData?.data || {};

        reset({
          title: data.title || '',
          sortOrder: data.sortOrder ?? '',
          smallDescription: data.smallDescription || '',
          largeDescription: data.largeDescription || '',
        });
        setEditorContent(data.largeDescription || '');
        setMasterYearId(data.masterYearId?._id || data.masterYearId || '');
        setPreviewUrl(data.fileUrl || '');
        setFileName(data.fileName || '');
        setMediaType(detectMediaType(data.fileUrl || '', { allowAllFiles: true }));
        setMediaFile(null);
        setMediaError('');
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load committee',
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommittee();
  }, [committeeId, reset, user?.token]);

  const handleMediaChange = useCallback(({ file, previewUrl: nextPreview, mediaType: nextType }) => {
    setMediaFile(file);
    setPreviewUrl(nextPreview);
    if (file?.name) setFileName(file.name);
    if (nextType) setMediaType(nextType);
    setMediaError('');
  }, []);

  const handleMediaClear = useCallback(() => {
    setMediaFile(null);
    setPreviewUrl('');
    setFileName('');
    setMediaType('File');
    setMediaError('');
  }, []);

  const onSubmit = async (formData) => {
    if (!masterYearId) {
      setYearError('Year is required');
      return;
    }
    setYearError('');

    if (!previewUrl && !mediaFile) {
      setMediaError('File is required');
      return;
    }

    setLoading(true);
    try {
      const uploadedUrl = await uploadMediaFile(mediaFile, previewUrl);
      if (!uploadedUrl) {
        setMediaError('File is required');
        setLoading(false);
        return;
      }

      const payload = {
        data: {
          title: formData.title.trim(),
          sortOrder: Number(formData.sortOrder),
          smallDescription: formData.smallDescription.trim(),
          largeDescription: editorContent,
          masterYearId,
          fileUrl: uploadedUrl,
          fileName: mediaFile?.name || fileName || '',
          mediaType: mediaType || detectMediaType(uploadedUrl, { allowAllFiles: true }),
        },
      };

      const url = committeeId ? `/api/commities/${committeeId}` : '/api/commities';
      const method = committeeId ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response?.data?.success) {
        toast.current.show({
          severity: 'success',
          summary: committeeId ? 'Updated' : 'Saved',
          detail: `Committee ${committeeId ? 'updated' : 'saved'} successfully`,
          life: 3000,
        });
        router.push('/admin/all-committees');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'A committee already exists for the selected year.'
          : 'Could not save committee');
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full">
      <Toast ref={toast} />
      <div className="w-full p-[20px] xl:p-[25px]">
        <h2 className="mb-3 text-[22px] font-[700] text-[#19212A]">
          {isUpdateMode ? 'Update Committee' : 'Add Committee'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white card-shadow p-[25px]" noValidate>
          <div className="space-y-4 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[250px]">
            <div className="flex flex-col gap-1">
              <label>Committee Title <span className="text-red-500">*</span></label>
              <InputText {...register('title', { required: true })} placeholder="Enter committee title" />
              {errors.title && <span className="text-sm text-red-500">This field is required</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label>Year <span className="text-red-500">*</span></label>
              <Dropdown
                value={masterYearId}
                options={yearOptions}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => {
                  setMasterYearId(e.value);
                  setYearError('');
                }}
                placeholder="Select year"
                className="w-full border rounded-none"
              />
              {yearError && <span className="text-sm text-red-500">{yearError}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label>Sort Order <span className="text-red-500">*</span></label>
              <InputText
                type="number"
                min="0"
                {...register('sortOrder', {
                  required: 'Sort order is required',
                  min: { value: 0, message: 'Sort order cannot be negative' },
                })}
                placeholder="Enter sort order"
              />
              {errors.sortOrder && (
                <span className="text-sm text-red-500">{errors.sortOrder.message || 'This field is required'}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label>Small Description <span className="text-red-500">*</span></label>
              <InputText {...register('smallDescription', { required: true })} placeholder="Enter short description" />
              {errors.smallDescription && <span className="text-sm text-red-500">This field is required</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label>Large Description <span className="text-red-500">*</span></label>
              <TextEditor value={editorContent} setEditorContent={setEditorContent} onChange={handleEditorChange} />
              <input type="hidden" {...register('largeDescription', { required: true })} />
              {errors.largeDescription && <span className="text-sm text-red-500">This field is required</span>}
            </div>

            <MediaUpload
              required
              allowAllFiles
              label="File Upload"
              maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB}
              previewUrl={previewUrl}
              mediaType={mediaType}
              file={mediaFile}
              fileName={fileName}
              error={mediaError}
              onChange={handleMediaChange}
              onClear={handleMediaClear}
              onError={(message) => {
                setMediaError(message);
                toast.current?.show({ severity: 'warn', summary: 'Upload', detail: message, life: 3000 });
              }}
            />

            <div className="mt-6 flex justify-center gap-6">
              <Link href="/admin/all-committees" className="cancelbtn px-4 py-2">Cancel</Link>
              <Button
                type="submit"
                className="rounded-none border-[#af251c] bg-primarycolor px-4 py-2 text-white"
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
