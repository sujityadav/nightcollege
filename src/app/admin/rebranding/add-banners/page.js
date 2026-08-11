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

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import DateRange, { validateDateRange } from '@/app/components/common/DateRange';
import MediaUpload, {
  detectMediaType,
  normalizeMediaTypeLabel,
  uploadMediaFile,
  DEFAULT_MAX_MEDIA_SIZE_MB,
} from '@/app/components/common/MediaUpload';

export default function AddBanner() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('Photo');
  const [mediaError, setMediaError] = useState('');
  const [originalMediaUrl, setOriginalMediaUrl] = useState('');
  const [status, setStatus] = useState(1);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bannerId = searchParams.get('id');

  const SideBarNavItems = [
    { label: 'Rebranding', href: '/admin/rebranding' },
    { label: 'Contact Information', href: '/admin/rebranding/contact-info' },
    { label: 'Flash Screen Popup', href: '/admin/rebranding/home-popup' },
  ];

  useEffect(() => {
    if (bannerId) {
      setIsUpdateMode(true);
      fetchBannerData(bannerId);
    }
  }, [bannerId]);

  const fetchBannerData = async (id) => {
    try {
      setLoading(true);

      const res = await axios.get(`/api/rebranding/getbyId`, {
        params: { id },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const banner = res.data.data;
      const bannerData = banner?.RebrandingData?.data || {};
      reset({
        title: bannerData.title,
        description: bannerData.description,
        sortNo: bannerData.sortNo,
      });
      setFromDate(bannerData.fromDate ? new Date(bannerData.fromDate) : null);
      setToDate(bannerData.toDate ? new Date(bannerData.toDate) : null);
      setMediaPreview(bannerData.photo || '');
      setMediaFile(null);
      setMediaType(
        normalizeMediaTypeLabel(bannerData.mediaType) ||
          detectMediaType(bannerData.photo || '')
      );
      setMediaError('');
      setOriginalMediaUrl(bannerData.photo || '');
      setStatus(Number(bannerData.status ?? 1));
    } catch (err) {
      console.error('Failed to fetch banner:', err);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch banner data',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = ({ file, previewUrl, mediaType: nextType }) => {
    setMediaFile(file);
    setMediaPreview(previewUrl);
    setMediaType(nextType || 'Photo');
    setMediaError('');
  };

  const handleMediaClear = () => {
    setMediaFile(null);
    setMediaPreview('');
    setMediaType('Photo');
    setMediaError('Photo or video is required');
  };

  const handleMediaError = (message) => {
    setMediaError(message);
    toast.current?.show({
      severity: 'warn',
      summary: 'Upload',
      detail: message,
      life: 3000,
    });
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

    if (!mediaPreview && !mediaFile) {
      setMediaError('Photo or video is required');
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please upload a photo or video',
        life: 3000,
      });
      return;
    }

    const maxBytes = DEFAULT_MAX_MEDIA_SIZE_MB * 1024 * 1024;
    if (mediaFile && mediaFile.size > maxBytes) {
      const message = `File size must be ${DEFAULT_MAX_MEDIA_SIZE_MB} MB or less.`;
      setMediaError(message);
      toast.current?.show({
        severity: 'warn',
        summary: 'File too large',
        detail: message,
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const mediaUrl = await uploadMediaFile(mediaFile, mediaPreview);
      if (!mediaUrl) {
        setMediaError('Photo or video is required');
        throw new Error('Photo or video is required');
      }

      const resolvedMediaType = mediaFile
        ? detectMediaType(mediaFile)
        : normalizeMediaTypeLabel(mediaType) || detectMediaType(mediaUrl);

      const payload = {
        data: {
          title: formData.title,
          description: formData.description,
          sortNo: Number(formData.sortNo),
          fromDate,
          toDate,
          photo: mediaUrl,
          mediaType: resolvedMediaType,
          status: bannerId ? status : 1,
        },
      };

      const url = bannerId ? `/api/rebranding/${bannerId}` : `/api/rebranding`;
      const method = bannerId ? 'put' : 'post';

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
        if (originalMediaUrl && originalMediaUrl !== mediaUrl) {
          try {
            await axios.delete('/api/upload', { data: { url: originalMediaUrl } });
          } catch (cleanupError) {
            console.warn('Old media cleanup warning:', cleanupError);
          }
        }

        toast.current.show({
          severity: 'success',
          summary: bannerId ? 'Updated' : 'Saved',
          detail: `Banner ${bannerId ? 'updated' : 'saved'} successfully`,
          life: 3000,
        });
        router.push('/admin/rebranding');
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Failed to save banner',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-w-0 items-start">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="shrink-0">
        <SubSidebar title="Rebranding" navItems={SideBarNavItems} />
      </div>

      <div className="min-w-0 flex-1 p-[20px] xl:p-[25px] 3xl:p-[1.563vw]">
        <div className="mb-3">
          <div className="flex justify-between">
            <h2 className="text-[#19212A] text-[14px] xl:text-[22px] 3xl:text-[1.146vw] font-[700] m-0">
              {isUpdateMode ? 'Update Banner' : 'Add Banner'}
            </h2>
            <Link
              href="/admin/rebranding"
              className="cancelbtn px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]"
            >
              Back
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]"
          noValidate
        >
          <div className="mx-auto w-full max-w-[720px] space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[#212325] text-[14px] font-[500]">Banner Title</label>
              <InputText
                {...register('title', { required: true })}
                placeholder="Enter your title"
                className="border rounded-none"
              />
              {errors.title && (
                <span className="text-red-500 text-sm">This field is required</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#212325] text-[14px] font-[500]">Banner Description</label>
              <InputText
                {...register('description', { required: true })}
                placeholder="Enter your description"
                className="border rounded-none"
              />
              {errors.description && (
                <span className="text-red-500 text-sm">This field is required</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#212325] text-[14px] font-[500]">Sort No.</label>
              <InputText
                type="number"
                {...register('sortNo', { required: true })}
                placeholder="Enter your sort number"
                className="border rounded-none"
              />
              {errors.sortNo && (
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
              allowVideo
              required
              maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB}
              previewUrl={mediaPreview}
              mediaType={mediaType}
              error={mediaError}
              onChange={handleMediaChange}
              onClear={handleMediaClear}
              onError={handleMediaError}
              showTypeBadge
            />

            <div className="mt-[30px]">
              <div className="flex justify-center gap-6">
                <Link
                  href="/admin/rebranding"
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
          </div>
        </form>
      </div>
    </div>
  );
}
