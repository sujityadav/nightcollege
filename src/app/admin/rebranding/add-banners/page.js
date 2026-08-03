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
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Link from 'next/link';
import Image from 'next/image';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';

const detectMediaType = (fileOrUrl) => {
  if (fileOrUrl instanceof File) {
    return fileOrUrl.type.startsWith('video/') ? 'video' : 'image';
  }

  if (typeof fileOrUrl === 'string' && fileOrUrl) {
    if (
      fileOrUrl.includes('/video/upload/') ||
      /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(fileOrUrl)
    ) {
      return 'video';
    }
  }

  return 'image';
};

export default function AddBanner() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [dateError, setDateError] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [originalMediaUrl, setOriginalMediaUrl] = useState('');
  const [status, setStatus] = useState(1);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bannerId = searchParams.get('id');

  const SideBarNavItems = [
    {
      label: 'Rebranding',
      href: '/admin/rebranding',
    },
    {
      label: 'Contact Information',
      href: '/admin/rebranding/contact-info',
    },
    {
      label: 'Flash Screen Popup',
      href: '/admin/rebranding/home-popup',
    },
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
      setMediaType(bannerData.mediaType || detectMediaType(bannerData.photo || ''));
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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Invalid file',
        detail: 'Please choose an image or video file.',
        life: 3000,
      });
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaType(isVideo ? 'video' : 'image');
  };

  const handleRemoveMedia = () => {
    const isVideo = mediaType === 'video';
    confirmDialog({
      header: isVideo ? 'Remove Video' : 'Remove Photo',
      message: `Are you sure you want to remove this ${isVideo ? 'video' : 'photo'}? Save the form to keep this change.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remove',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setMediaFile(null);
        setMediaPreview('');
        setMediaType('image');
        toast.current?.show({
          severity: 'info',
          summary: isVideo ? 'Video removed' : 'Photo removed',
          detail: 'Save the form to update the banner.',
          life: 2500,
        });
      },
    });
  };

  const uploadMedia = async () => {
    if (!(mediaFile instanceof File)) return mediaPreview || '';

    const formData = new FormData();
    formData.append('file', mediaFile);
    const response = await axios.post('/api/upload', formData);
    const mediaUrl = response.data?.result?.[0]?.url;

    if (!mediaUrl) {
      throw new Error(response.data?.errorMessage || 'Media upload failed');
    }

    return mediaUrl;
  };

  const validateDates = (fromValue = fromDate, toValue = toDate, { requireBoth = false } = {}) => {
    if (!fromValue || !toValue) {
      if (requireBoth) {
        const message = 'From date and To date are required';
        setDateError(message);
        return message;
      }
      setDateError('');
      return '';
    }

    const from = new Date(fromValue);
    const to = new Date(toValue);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    if (from.getTime() > to.getTime()) {
      const message = 'From date should be less than or equal to To date';
      setDateError(message);
      return message;
    }

    setDateError('');
    return '';
  };

  const onSubmit = async (formData) => {
    const dateValidationError = validateDates(fromDate, toDate, { requireBoth: true });
    if (dateValidationError) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: dateValidationError,
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const mediaUrl = await uploadMedia();
      const resolvedMediaType = mediaFile
        ? detectMediaType(mediaFile)
        : mediaType || detectMediaType(mediaUrl);

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
        // Extra cleanup if media was replaced/removed
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
            <Link href="/admin/rebranding" className="cancelbtn px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]">
              Back
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]">
          <div className="mx-auto w-full max-w-[720px] space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]">Banner Title</label>
              <InputText
                {...register('title', { required: true })}
                placeholder="Enter your title"
                className="border rounded-none"
              />
              {errors.title && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]">Banner Description</label>
              <InputText
                {...register('description', { required: true })}
                placeholder="Enter your description"
                className="border rounded-none"
              />
              {errors.description && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]">Sort No.</label>
              <InputText
                type="number"
                {...register('sortNo', { required: true })}
                placeholder="Enter your sort number"
                className="border rounded-none"
              />
              {errors.sortNo && <span className="text-red-500 text-sm">This field is required</span>}
            </div>

            <div className="flex gap-5">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]">From (Date)</label>
                <Calendar
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.value);
                    validateDates(e.value, toDate);
                  }}
                  maxDate={toDate || undefined}
                  locale="en"
                  dateFormat="dd/mm/yy"
                  mask="99/99/9999"
                  placeholder="dd/mm/yyyy"
                  className="w-full"
                  showIcon
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]">To (Date)</label>
                <Calendar
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.value);
                    validateDates(fromDate, e.value);
                  }}
                  minDate={fromDate || undefined}
                  locale="en"
                  dateFormat="dd/mm/yy"
                  mask="99/99/9999"
                  placeholder="dd/mm/yyyy"
                  className="w-full"
                  showIcon
                />
              </div>
            </div>
            {dateError && <span className="text-red-500 text-sm">{dateError}</span>}

            <div className="flex flex-col gap-1">
              <label className="text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]">Photo/Video Upload</label>
              <div className="flex border-2 border-[#b9d1ffab] border-dashed bg-[#fffef5] p-4 justify-center group relative cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  className="absolute left-0 right-0 top-0 bottom-0 opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Image src="/images/admin/svg/upload.svg" className="inline mb-3" width={40} height={40} alt="Upload" />
                  <p className="text-[#6C768B] xl:text-[0.730vw] mb-3">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[0.750rem] xl:text-[0.625vw] text-[#6C768B] font-semibold mb-4">
                    Image or Video · Max. File Size: 30MB
                  </p>
                  <button type="button" className="text-white text-[0.750rem] xl:text-[0.625vw] bg-[#4FB155] border border-[#4FB155] rounded xl:py-[0.417vw] py-2 xl:px-[0.417vw] px-2 inline-block group-hover:bg-[#3f8643] group-hover:border-[#3f8643] transition duration-300 ease-in-out">
                    <i className="rdmark-table-search mr-2"></i>
                    Browse File
                  </button>
                </div>
              </div>
            </div>

            {mediaPreview && (
              <div className="p-2 border flex gap-5 items-center">
                <div>
                  {mediaType === 'video' ? (
                    <video
                      src={mediaPreview}
                      controls
                      className="inline mb-3 max-h-[180px] w-auto rounded"
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      className="inline mb-3 max-h-[150px] w-auto object-cover"
                      alt="Uploaded Banner"
                    />
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="w-auto flex gap-2 items-center bg-[#A0AEC0] text-[#19212A] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500] p-[10px] xl:p-[10px] 3xl:p-[0.521vw] leading-none"
                  >
                    <i className="pi pi-times-circle"></i>{' '}
                    {mediaType === 'video' ? 'Remove Video' : 'Remove Photo'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-[30px]">
              <div className="flex justify-center gap-6">
                <Link href="/admin/rebranding" className="cancelbtn px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]">
                  Cancel
                </Link>
                <Button
                  type="submit"
                  className="text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%] rounded-none p-button-raised"
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
