'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import DateRange, { validateDateRange } from '@/app/components/common/DateRange';

const SideBarNavItems = [
  { label: 'Rebranding', href: '/admin/rebranding' },
  { label: 'Contact Information', href: '/admin/rebranding/contact-info' },
  { label: 'Flash Screen Popup', href: '/admin/rebranding/home-popup' },
];

export default function AddFlashScreen() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState('');
  const [status, setStatus] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const flashId = searchParams.get('id');

  useEffect(() => {
    if (flashId) {
      setIsUpdateMode(true);
      fetchFlashScreen(flashId);
    }
  }, [flashId]);

  const fetchFlashScreen = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/flash-screen/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = res.data?.data?.FlashScreenData?.data || {};
      setFromDate(data.fromDate ? new Date(data.fromDate) : null);
      setToDate(data.toDate ? new Date(data.toDate) : null);
      setPhotoPreview(data.photo || '');
      setPhotoFile(null);
      setOriginalPhotoUrl(data.photo || '');
      setStatus(Number(data.status ?? 1));
      setPhotoError('');
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load flash screen',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Invalid file',
        detail: 'Please choose an image file.',
        life: 3000,
      });
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoError('');
  };

  const handleRemovePhoto = () => {
    confirmDialog({
      header: 'Remove Photo',
      message: 'Are you sure you want to remove this photo? Save the form to keep this change.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remove',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setPhotoFile(null);
        setPhotoPreview('');
        toast.current?.show({
          severity: 'info',
          summary: 'Photo removed',
          detail: 'Save the form to update the flash screen.',
          life: 2500,
        });
      },
    });
  };

  const uploadPhoto = async () => {
    if (!(photoFile instanceof File)) return photoPreview || '';

    const formData = new FormData();
    formData.append('photo', photoFile);
    const response = await axios.post('/api/upload', formData);
    const imageUrl = response.data?.result?.[0]?.url;

    if (!imageUrl) {
      throw new Error(response.data?.errorMessage || 'Photo upload failed');
    }

    return imageUrl;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

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

    if (!photoPreview && !photoFile) {
      setPhotoError('Photo is required');
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Photo is required',
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const photoUrl = await uploadPhoto();

      if (!photoUrl) {
        setPhotoError('Photo is required');
        throw new Error('Photo is required');
      }

      const payload = {
        data: {
          photo: photoUrl,
          fromDate,
          toDate,
          status: flashId ? status : 1,
        },
      };

      const response = flashId
        ? await axios.put(`/api/flash-screen/${flashId}`, payload, {
            headers: { Authorization: `Bearer ${user?.token}` },
          })
        : await axios.post('/api/flash-screen', payload, {
            headers: { Authorization: `Bearer ${user?.token}` },
          });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to save flash screen');
      }

      if (originalPhotoUrl && originalPhotoUrl !== photoUrl) {
        try {
          await axios.delete('/api/upload', { data: { url: originalPhotoUrl } });
        } catch (cleanupError) {
          console.warn('Old flash-screen media cleanup warning:', cleanupError);
        }
      }

      toast.current?.show({
        severity: 'success',
        summary: flashId ? 'Updated' : 'Saved',
        detail: `Flash screen ${flashId ? 'updated' : 'saved'} successfully`,
        life: 2500,
      });
      router.push('/admin/rebranding/home-popup');
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || err.message || 'Failed to save flash screen',
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
              {isUpdateMode ? 'Update Flash Screen' : 'Add Flash Screen'}
            </h2>
            <Link
              href="/admin/rebranding/home-popup"
              className="cancelbtn px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]"
            >
              Back
            </Link>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white card-shadow h-full p-[20px] xl:p-[25px] 3xl:p-[1.563vw]"
          noValidate
        >
          <div className="mx-auto w-full max-w-[720px] space-y-3">
            <DateRange
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              fromLabel="From Date"
              toLabel="To Date"
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-[#212325] text-[14px] font-[500]">
                Photo Upload <span className="text-red-500">*</span>
              </label>
              <div className="flex border-2 border-[#b9d1ffab] border-dashed bg-[#fffef5] p-4 justify-center group relative cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="absolute left-0 right-0 top-0 bottom-0 opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Image
                    src="/images/admin/svg/upload.svg"
                    className="inline mb-3"
                    width={40}
                    height={40}
                    alt="Upload"
                  />
                  <p className="text-[#6C768B] xl:text-[0.730vw] mb-3">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[0.750rem] xl:text-[0.625vw] text-[#6C768B] font-semibold mb-4">
                    Max. File Size: 30MB
                  </p>
                  <button
                    type="button"
                    className="text-white text-[0.750rem] xl:text-[0.625vw] bg-[#4FB155] border border-[#4FB155] rounded xl:py-[0.417vw] py-2 xl:px-[0.417vw] px-2 inline-block"
                  >
                    Browse File
                  </button>
                </div>
              </div>
              {photoError && <span className="text-red-500 text-sm">{photoError}</span>}
            </div>

            {photoPreview && (
              <div className="p-2 border flex gap-5 items-center">
                <div>
                  <img
                    src={photoPreview}
                    className="inline mb-3 max-h-[150px] w-auto object-cover"
                    alt="Flash screen preview"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="w-auto flex gap-2 items-center bg-[#A0AEC0] text-[#19212A] text-[14px] font-[500] p-[10px] leading-none"
                  >
                    <i className="pi pi-times-circle"></i> Remove Photo
                  </button>
                </div>
              </div>
            )}

            <div className="mt-[30px]">
              <div className="flex justify-center gap-6">
                <Link
                  href="/admin/rebranding/home-popup"
                  className="cancelbtn px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%]"
                >
                  Cancel
                </Link>
                <Button
                  type="submit"
                  loading={loading}
                  className="text-white border bg-primarycolor border-[#af251c] px-[14px] xl:px-[18px] 3xl:px-[0.938vw] py-[10px] xl:py-[12px] 3xl:py-[0.625vw] leading-[100%] rounded-none p-button-raised"
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
