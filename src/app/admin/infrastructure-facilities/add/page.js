'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import Link from 'next/link';
import TextEditor from '@/app/components/common/editor';
import DateRange, { validateDateRange } from '@/app/components/common/DateRange';
import MediaUpload, {
  uploadMediaAttachments,
  detectMediaType,
  DEFAULT_MAX_MEDIA_SIZE_MB,
} from '@/app/components/common/MediaUpload';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

const DATA_KEY = 'InfrastructureFacilitiesData';

export default function AddInfrastructureFacilityPage() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [originalAttachmentUrls, setOriginalAttachmentUrls] = useState([]);
  const [status, setStatus] = useState(1);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get('id');

  usePageBreadcrumbs({
    pageTitle: recordId ? 'Update Infrastructure Facility' : 'Add Infrastructure Facility',
    breadcrumbs: [
      { label: 'Infrastructure Facilities', href: '/admin/infrastructure-facilities' },
      { label: recordId ? 'Update' : 'Add', isCurrent: true },
    ],
  });

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('largeDescription', value);
  };

  useEffect(() => {
    if (recordId) {
      setIsUpdateMode(true);
      fetchRecord(recordId);
    }
  }, [recordId]);

  const fetchRecord = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/infrastructure-facilities/getbyId', {
        params: { id },
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const record = res.data.data?.[0];
      const data = record?.[DATA_KEY]?.data || {};

      reset({
        title: data.title,
        smallDescription: data.smallDescription,
        largeDescription: data.largeDescription,
      });
      setEditorContent(data.largeDescription || '');
      setFromDate(data.fromDate ? new Date(data.fromDate) : null);
      setToDate(data.toDate ? new Date(data.toDate) : null);

      const attachments = Array.isArray(data.attachments) ? data.attachments : [];
      setMediaItems(
        attachments.map((att, index) => ({
          id: `existing-${index}-${att.url}`,
          previewUrl: att.url,
          file: null,
          mediaType: att.mediaType || detectMediaType(att.url, { allowAllFiles: true }),
          fileName: att.fileName || '',
        }))
      );
      setOriginalAttachmentUrls(attachments.map((att) => att.url).filter(Boolean));
      setStatus(Number(data.status ?? 1));
      setMediaError('');
    } catch (err) {
      console.error('Failed to fetch record:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    const dateValidationError = validateDateRange(fromDate, toDate, { requireBoth: true });
    if (dateValidationError) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: dateValidationError,
        life: 3000,
      });
      return;
    }

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

    const maxBytes = DEFAULT_MAX_MEDIA_SIZE_MB * 1024 * 1024;
    const oversizedItem = mediaItems.find(
      (item) => item.file instanceof File && item.file.size > maxBytes
    );
    if (oversizedItem) {
      const message = `Each file must be ${DEFAULT_MAX_MEDIA_SIZE_MB} MB or less.`;
      setMediaError(message);
      toast.current?.show({ severity: 'warn', summary: 'File too large', detail: message, life: 3000 });
      return;
    }

    try {
      setLoading(true);
      const attachments = await uploadMediaAttachments(mediaItems, { allowAllFiles: true });

      const payloadData = {
        title: formData.title,
        smallDescription: formData.smallDescription,
        largeDescription: editorContent,
        fromDate,
        toDate,
        attachments,
        status: recordId ? status : 1,
      };

      const url = recordId
        ? `/api/infrastructure-facilities/${recordId}`
        : '/api/infrastructure-facilities';
      const method = recordId ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: { data: payloadData, ...(recordId && { _id: recordId }) },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response?.data?.success) {
        const newUrls = attachments.map((att) => att.url);
        const removedUrls = originalAttachmentUrls.filter((url) => !newUrls.includes(url));
        for (const url of removedUrls) {
          try {
            await axios.delete('/api/upload', { data: { url } });
          } catch (cleanupError) {
            console.warn('Old media cleanup warning:', cleanupError);
          }
        }

        toast.current.show({
          severity: 'success',
          summary: recordId ? 'Updated' : 'Saved',
          detail: `Content ${recordId ? 'updated' : 'saved'} successfully`,
          life: 3000,
        });
        router.push('/admin/infrastructure-facilities');
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Failed to save',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldLabelClass =
    'text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]';

  return (
    <div className="flex w-full">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full">
        <div className="flex justify-between mb-3">
          <h2 className="text-[#19212A] text-[22px] font-[700] m-0">
            {isUpdateMode ? 'Update Infrastructure Facility' : 'Add Infrastructure Facility'}
          </h2>
          <Link href="/admin/infrastructure-facilities" className="cancelbtn px-4 py-2 leading-none">
            Back
          </Link>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white card-shadow p-[20px] xl:p-[25px] 3xl:p-[1.563vw]"
          noValidate
        >
          <div className="mx-auto w-full max-w-[720px] space-y-3">
            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>Title</label>
              <InputText
                {...register('title', { required: true })}
                placeholder="Enter title"
                className="border rounded-none"
              />
              {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>Small Description</label>
              <InputText
                {...register('smallDescription', { required: true })}
                placeholder="Enter short description"
                className="border rounded-none"
              />
              {errors.smallDescription && (
                <span className="text-red-500 text-sm">This field is required</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>Large Description</label>
              <TextEditor
                value={editorContent}
                setEditorContent={setEditorContent}
                onChange={handleEditorChange}
              />
              <input type="hidden" {...register('largeDescription', { required: true })} />
              {errors.largeDescription && (
                <span className="text-red-500 text-sm">This field is required</span>
              )}
            </div>

            <DateRange
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              required
            />

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
                toast.current?.show({
                  severity: 'warn',
                  summary: 'Upload',
                  detail: message,
                  life: 3000,
                });
              }}
            />

            <div className="mt-[30px] flex justify-center gap-6">
              <Link
                href="/admin/infrastructure-facilities"
                className="cancelbtn px-[14px] xl:px-[18px] py-[10px] xl:py-[12px] leading-[100%]"
              >
                Cancel
              </Link>
              <Button
                type="submit"
                className="text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[18px] py-[10px] xl:py-[12px] leading-[100%] rounded-none p-button-raised"
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
