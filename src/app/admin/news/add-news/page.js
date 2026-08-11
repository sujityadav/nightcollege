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
import { ConfirmDialog } from 'primereact/confirmdialog';
import Link from 'next/link';
import TextEditor from '@/app/components/common/editor';
import DateRange, { validateDateRange } from '@/app/components/common/DateRange';
import MediaUpload, {
  uploadMediaFile,
  DEFAULT_MAX_MEDIA_SIZE_MB,
} from '@/app/components/common/MediaUpload';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

/** Normalize category from DB (string or array) into Chips value array */
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

export default function AddNews() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [originalMediaUrl, setOriginalMediaUrl] = useState('');
  const user = useSelector((state) => state.auth.user);
  const toast = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsId = searchParams.get('id');

  const handleEditorChange = (value) => {
    setEditorContent(value);
    setValue('largeDescription', value);
  };

  useEffect(() => {
    if (newsId) {
      setIsUpdateMode(true);
      fetchNewsData(newsId);
    }
  }, [newsId]);

  const fetchNewsData = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/news/getbyId', {
        params: { id },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const news = res.data.data;
      reset({
        title: news[0]?.Newsdata?.data?.title,
        smallDescription: news[0]?.Newsdata?.data?.smallDescription,
        largeDescription: news[0]?.Newsdata?.data?.largeDescription,
        location: news[0]?.Newsdata?.data?.location,
      });
      setCategories(normalizeCategories(news[0]?.Newsdata?.data?.category));
      setCategoryError('');
      setEditorContent(news[0]?.Newsdata?.data?.largeDescription);
      setFromDate(
        news[0]?.Newsdata?.data?.fromDate
          ? new Date(news[0]?.Newsdata?.data?.fromDate)
          : null
      );
      setToDate(
        news[0]?.Newsdata?.data?.toDate
          ? new Date(news[0]?.Newsdata?.data?.toDate)
          : null
      );
      const photo = news[0]?.Newsdata?.data?.photo || '';
      setMediaPreview(photo);
      setMediaFile(null);
      setMediaError('');
      setOriginalMediaUrl(photo);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = ({ file, previewUrl }) => {
    setMediaFile(file);
    setMediaPreview(previewUrl);
    setMediaError('');
  };

  const handleMediaClear = () => {
    setMediaFile(null);
    setMediaPreview('');
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

      formData.fromDate = fromDate;
      formData.toDate = toDate;
      formData.largeDescription = editorContent;
      formData.category = cleanedCategories;
      formData.photo = mediaUrl;
      formData.mediaType = 'Photo';

      const payload = { data: formData, ...(newsId && { _id: newsId }) };

      const response = await axios({
        method: newsId ? 'put' : 'post',
        url: newsId ? `/api/news/${newsId}` : '/api/news',
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response?.data?.success) {
        if (originalMediaUrl && mediaUrl && originalMediaUrl !== mediaUrl) {
          try {
            await axios.delete('/api/upload', { data: { url: originalMediaUrl } });
          } catch (cleanupError) {
            console.warn('Old media cleanup warning:', cleanupError);
          }
        }

        toast.current.show({
          severity: 'success',
          summary: newsId ? 'Updated' : 'Saved',
          detail: `Content ${newsId ? 'updated' : 'saved'} successfully`,
          life: 3000,
        });
        router.push('/admin/news');
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Failed to save news',
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
            {isUpdateMode ? 'Update News' : 'Add News'}
          </h2>
          <Link href="/admin/news" className="cancelbtn px-4 py-2 leading-none">
            Back
          </Link>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white card-shadow p-[20px] xl:p-[25px] 3xl:p-[1.563vw]"
          noValidate
        >
          {/* Same container pattern as rebranding so DateRange is full-width */}
          <div className="mx-auto w-full max-w-[720px] space-y-3">
            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>News Title</label>
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

            {/* Shared DateRange: dd/mm/yyyy, min/max, from ≤ to (same as rebranding) */}
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
              maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB}
              previewUrl={mediaPreview}
              mediaType="Photo"
              error={mediaError}
              onChange={handleMediaChange}
              onClear={handleMediaClear}
              onError={handleMediaError}
            />

            <div className="mt-[30px] flex justify-center gap-6">
              <Link
                href="/admin/news"
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
