'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import TextEditor from '@/app/components/common/editor';
import MediaUpload, {
  DEFAULT_MAX_MEDIA_SIZE_MB,
  detectMediaType,
  uploadMediaFile,
} from '@/app/components/common/MediaUpload';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

const fieldLabelClass = 'text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]';

function formatMasterYearOption(year) {
  return `${year.fromYear} – ${year.toYear}`;
}

export default function StudentCornerFormPage() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [description, setDescription] = useState('');
  const [masterYearId, setMasterYearId] = useState('');
  const [yearOptions, setYearOptions] = useState([]);
  const [yearError, setYearError] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [mediaType, setMediaType] = useState('Photo');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const router = useRouter();
  const id = useSearchParams().get('id');
  const isEditMode = Boolean(id);

  usePageBreadcrumbs({
    pageTitle: isEditMode ? 'Update Student Corner' : 'Add Student Corner',
    breadcrumbs: [
      { label: 'Student Corner', href: '/admin/student-corner' },
      { label: isEditMode ? 'Update' : 'Add', isCurrent: true },
    ],
  });

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
    if (!id) return;

    const loadItem = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/student-corner/${id}`);
        const item = response.data.data;
        reset({
          title: item.title || '',
          sortOrder: item.sortOrder ?? '',
        });
        setDescription(item.description || '');
        setValue('description', item.description || '');
        setMasterYearId(item.masterYearId?._id || item.masterYearId || '');
        setPreviewUrl(item.fileUrl || '');
        setFileName(item.fileName || '');
        setMediaType(detectMediaType(item.fileUrl || '', { allowAllFiles: true }));
        setMediaFile(null);
        setStatus(item.status ?? true);
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load student corner item',
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id, reset, setValue]);

  const handleMediaChange = ({ file, previewUrl: nextPreview, mediaType: nextType }) => {
    setMediaFile(file);
    setPreviewUrl(nextPreview);
    if (file?.name) setFileName(file.name);
    if (nextType) setMediaType(nextType);
    setMediaError('');
  };

  const handleMediaClear = () => {
    setMediaFile(null);
    setPreviewUrl('');
    setFileName('');
    setMediaType('Photo');
    setMediaError('');
  };

  const handleMediaError = (message) => {
    setMediaError(message);
    toast.current?.show({ severity: 'warn', summary: 'Upload', detail: message, life: 3000 });
  };

  const submit = async (formData) => {
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
        title: formData.title.trim(),
        description,
        masterYearId,
        fileUrl: uploadedUrl,
        fileName: mediaFile?.name || fileName || '',
        sortOrder: Number(formData.sortOrder),
        status,
      };

      await axios[isEditMode ? 'put' : 'post'](
        isEditMode ? `/api/student-corner/${id}` : '/api/student-corner',
        payload
      );

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Student corner item ${isEditMode ? 'updated' : 'saved'} successfully`,
        life: 2500,
      });
      router.push('/admin/student-corner');
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Could not save student corner item',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-[20px] xl:p-[25px] w-full">
      <Toast ref={toast} />
      <div className="flex justify-between mb-3">
        <h2 className="text-[22px] font-[700] m-0">{isEditMode ? 'Update' : 'Add'} Student Corner</h2>
        <Link href="/admin/student-corner" className="cancelbtn px-4 py-2 leading-none">
          Back
        </Link>
      </div>
      <form onSubmit={handleSubmit(submit)} className="bg-white card-shadow p-[25px]" noValidate>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <InputText
              className="border rounded-none"
              placeholder="Enter title"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title?.message && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>
              Description <span className="text-red-500">*</span>
            </label>
            <TextEditor
              value={description}
              setEditorContent={setDescription}
              onChange={(value) => {
                setDescription(value);
                setValue('description', value);
              }}
            />
            <input type="hidden" {...register('description', { required: 'Description is required' })} />
            {errors.description?.message && (
              <span className="text-red-500 text-sm">{errors.description.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>
              Year <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={masterYearId}
              options={yearOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(event) => {
                setMasterYearId(event.value);
                setYearError('');
              }}
              placeholder="Select year"
              className="w-full border rounded-none"
            />
            {yearError && <span className="text-red-500 text-sm">{yearError}</span>}
          </div>

          <MediaUpload
            required
            label="File Upload"
            allowAllFiles
            maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB}
            previewUrl={previewUrl}
            mediaType={mediaType}
            file={mediaFile}
            fileName={fileName}
            error={mediaError}
            onChange={handleMediaChange}
            onClear={handleMediaClear}
            onError={handleMediaError}
          />

          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>
              Sort Order <span className="text-red-500">*</span>
            </label>
            <InputText
              type="number"
              min="0"
              className="border rounded-none"
              {...register('sortOrder', {
                required: 'Sort order is required',
                min: { value: 0, message: 'Sort order cannot be negative' },
              })}
            />
            {errors.sortOrder?.message && (
              <span className="text-red-500 text-sm">{errors.sortOrder.message}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className={fieldLabelClass} htmlFor="student-corner-status">
              Status
            </label>
            <InputSwitch
              inputId="student-corner-status"
              checked={status}
              onChange={(event) => setStatus(event.value)}
            />
            <span className="text-sm text-[#494E5F]">{status ? 'Active' : 'Inactive'}</span>
          </div>

          <div className="mt-[30px] flex justify-center gap-6">
            <Link href="/admin/student-corner" className="cancelbtn px-[14px] xl:px-[18px] py-[10px] xl:py-[12px] leading-[100%]">
              Cancel
            </Link>
            <Button
              type="submit"
              loading={loading}
              className="text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[18px] py-[10px] xl:py-[12px] leading-[100%] rounded-none p-button-raised"
            >
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
