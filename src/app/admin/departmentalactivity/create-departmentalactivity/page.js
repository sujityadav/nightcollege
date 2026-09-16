'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { InputText } from 'primereact/inputtext';
import { Chips } from 'primereact/chips';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import TextEditor from '@/app/components/common/editor';
import DateRange, { validateDateRange } from '@/app/components/common/DateRange';
import MediaUpload, {
  uploadMediaItems,
  normalizePhotoList,
  DEFAULT_MAX_MEDIA_SIZE_MB,
} from '@/app/components/common/MediaUpload';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

const normalizeCategories = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export default function AddDepartmentalActivity() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [originalPhotoUrls, setOriginalPhotoUrls] = useState([]);
  const [status, setStatus] = useState(1);
  const [depatmentId, setDepatmentId] = useState(null);
  const [SubdepatmentId, setSubdepatmentId] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = searchParams.get('id');
  const subDepartmentId = searchParams.get('subDepartmentId');
  const activityListUrl = `/admin/departmentalactivity?subDepartmentId=${subDepartmentId}`;

  const subjectsListUrl = depatmentId ? `/admin/subjects?depatmentId=${depatmentId}` : null;
  const subPointsListUrl =
    SubdepatmentId && depatmentId
      ? `/admin/sub-points?SubdepatmentId=${SubdepatmentId}&depatmentId=${depatmentId}`
      : SubdepatmentId
        ? `/admin/sub-points?SubdepatmentId=${SubdepatmentId}`
        : null;

  usePageBreadcrumbs({
    pageTitle: isUpdateMode ? 'Update Departmental Activity' : 'Add Departmental Activity',
    breadcrumbs: [
      { label: 'All Departments', href: '/admin/all-departments' },
      ...(subjectsListUrl ? [{ label: 'Subjects', href: subjectsListUrl }] : []),
      ...(subPointsListUrl ? [{ label: 'Sub Points', href: subPointsListUrl }] : []),
      { label: 'Departmental Activity', href: activityListUrl },
      {
        label: isUpdateMode ? 'Update Departmental Activity' : 'Add Departmental Activity',
        isCurrent: true,
      },
    ],
  });

  useEffect(() => {
    if (!subDepartmentId) return;

    const fetchParentBreadcrumbData = async () => {
      try {
        const response = await axios.get('/api/subdepartment/getbyId', {
          params: { id: subDepartmentId },
        });
        const subjectId = response.data?.data?.[0]?.SubDepartmentsData?.data?.SubdepatmentId;
        if (subjectId) setSubdepatmentId(subjectId);

        if (subjectId) {
          const subjectResponse = await axios.get('/api/innerdepartments/getbyId', {
            params: { id: subjectId },
          });
          const parentId =
            subjectResponse.data?.data?.[0]?.InnerDepartmentsData?.data?.depatmentId;
          if (parentId) setDepatmentId(parentId);
        }
      } catch (error) {
        console.error('Failed to fetch breadcrumb data:', error);
      }
    };

    fetchParentBreadcrumbData();
  }, [subDepartmentId]);

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('largeDescription', value);
  };

  useEffect(() => {
    if (activityId) {
      setIsUpdateMode(true);
      fetchActivityData(activityId);
    }
  }, [activityId]);

  const fetchActivityData = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/departmentalactivity/getbyId`, {
        params: { id },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const activity = res.data.data;
      const activityData = activity[0]?.DepartmentlActivityData?.data || {};

      reset({
        title: activityData.title,
        smallDescription: activityData.smallDescription,
        largeDescription: activityData.largeDescription,
        location: activityData.location,
      });
      setCategories(normalizeCategories(activityData.category));
      setCategoryError('');
      setEditorContent(activityData.largeDescription);
      setFromDate(activityData.fromDate ? new Date(activityData.fromDate) : null);
      setToDate(activityData.toDate ? new Date(activityData.toDate) : null);

      const photos = normalizePhotoList(activityData.photos || activityData.photo);
      setMediaItems(
        photos.map((url, index) => ({
          id: `existing-${index}-${url}`,
          previewUrl: url,
          file: null,
          mediaType: 'Photo',
        }))
      );
      setMediaError('');
      setOriginalPhotoUrls(photos);
      setStatus(Number(activityData.status ?? 1));
    } catch (err) {
      console.error('Failed to fetch departmental activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaItemsChange = (items) => {
    setMediaItems(items);
    setMediaError('');
  };

  const handleMediaClear = () => {
    setMediaItems([]);
    setMediaError('');
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

    const cleanedCategories = normalizeCategories(categories);
    if (cleanedCategories.length === 0) {
      setCategoryError('At least one category is required');
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please add at least one category',
        life: 3000,
      });
      return;
    }
    setCategoryError('');

    const maxBytes = DEFAULT_MAX_MEDIA_SIZE_MB * 1024 * 1024;
    const oversizedItem = mediaItems.find(
      (item) => item.file instanceof File && item.file.size > maxBytes
    );
    if (oversizedItem) {
      const message = `Each file must be ${DEFAULT_MAX_MEDIA_SIZE_MB} MB or less.`;
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

      const photoUrls = await uploadMediaItems(mediaItems);

      formData.fromDate = fromDate;
      formData.toDate = toDate;
      formData.largeDescription = editorContent;
      formData.category = cleanedCategories;
      formData.photos = photoUrls;
      formData.photo = photoUrls[0] || '';
      formData.mediaType = 'Photo';
      formData.status = activityId ? status : 1;
      formData.subDepartmentId = subDepartmentId;

      const payload = {
        data: formData,
        ...(activityId && { _id: activityId }),
      };

      const url = activityId
        ? `/api/departmentalactivity/${activityId}`
        : `/api/departmentalactivity`;
      const method = activityId ? 'put' : 'post';

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
        const removedUrls = originalPhotoUrls.filter((url) => !photoUrls.includes(url));
        for (const url of removedUrls) {
          try {
            await axios.delete('/api/upload', { data: { url } });
          } catch (cleanupError) {
            console.warn('Old media cleanup warning:', cleanupError);
          }
        }

        toast.current.show({
          severity: 'success',
          summary: activityId ? 'Updated' : 'Saved',
          detail: `Departmental activity ${activityId ? 'updated' : 'saved'} successfully`,
          life: 3000,
        });
        router.push(activityListUrl);
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Failed to save departmental activity',
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
      <div className="p-[20px] xl:p-[25px] 3xl:p-[1.563vw] w-full">
        <div className="flex justify-between mb-3">
          <h2 className="text-[#19212A] text-[22px] font-[700] m-0">
            {isUpdateMode ? 'Update Departmental Activity' : 'Add Departmental Activity'}
          </h2>
          <Link href={activityListUrl} className="cancelbtn px-4 py-2 leading-none">
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
              <label className={fieldLabelClass}>Department Title</label>
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

            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>
                Category <span className="text-red-500">*</span>
              </label>
              <Chips
                value={categories}
                onChange={(e) => {
                  const next = e.value || [];
                  setCategories(next);
                  if (next.length > 0) setCategoryError('');
                }}
                separator=","
                addOnBlur
                allowDuplicate={false}
                placeholder={categories.length ? '' : 'Type category and press Enter'}
                className="w-full app-category-chips"
              />
              <span className="text-[#6C768B] text-xs">
                Press Enter or comma after each category
              </span>
              {categoryError && (
                <span className="text-red-500 text-sm">{categoryError}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>Location</label>
              <InputText
                {...register('location', { required: true })}
                placeholder="Enter location"
                className="border rounded-none"
              />
              {errors.location && (
                <span className="text-red-500 text-sm">This field is required</span>
              )}
            </div>

            <MediaUpload
              allowVideo={false}
              multiple
              label="Photo Upload"
              maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB}
              items={mediaItems}
              error={mediaError}
              onItemsChange={handleMediaItemsChange}
              onClear={handleMediaClear}
              onError={handleMediaError}
            />

            <div className="mt-[30px] flex justify-center gap-6">
              <Link
                href={activityListUrl}
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
