'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { RadioButton } from 'primereact/radiobutton';
import TextEditor from '@/app/components/common/editor';
import { uploadMediaFile, DEFAULT_MAX_MEDIA_SIZE_MB } from '@/app/components/common/MediaUpload';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

const TYPE_OPTIONS = ['Content', 'Link', 'Document'];

const slugify = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const fieldLabelClass = 'text-[#212325] text-[14px] font-[500]';

export default function QuickLinkFormPage() {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      sortOrder: '',
      linkUrl: '',
    },
  });

  const [type, setType] = useState('Content');
  const [content, setContent] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentError, setDocumentError] = useState('');
  const [contentError, setContentError] = useState('');
  const [linkError, setLinkError] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  const toast = useRef(null);
  const router = useRouter();
  const id = useSearchParams().get('id');
  const isEditMode = Boolean(id);
  const titleValue = watch('title');

  usePageBreadcrumbs({
    pageTitle: isEditMode ? 'Update Quick Link' : 'Add Quick Link',
    breadcrumbs: [
      { label: 'Quick Links', href: '/admin/quick-links' },
      { label: isEditMode ? 'Update Quick Link' : 'Add Quick Link', isCurrent: true },
    ],
  });

  useEffect(() => {
    if (!slugManuallyEdited && type === 'Content' && titleValue) {
      setValue('slug', slugify(titleValue));
    }
  }, [titleValue, slugManuallyEdited, type, setValue]);

  useEffect(() => {
    if (!id) return;

    const loadQuickLink = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/quick-links/${id}`);
        const item = res.data.data;
        reset({
          title: item.title || '',
          slug: item.slug || '',
          sortOrder: item.sortOrder ?? '',
          linkUrl: item.linkUrl || '',
        });
        setType(item.type || 'Content');
        setContent(item.content || '');
        setDocumentUrl(item.documentUrl || '');
        setDocumentName(item.documentName || '');
        setStatus(item.status ?? true);
        setSlugManuallyEdited(true);
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load quick link',
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuickLink();
  }, [id, reset]);

  const handleContentChange = (value) => {
    setContent(value);
    setValue('content', value);
    setContentError('');
  };

  const handleDocumentSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > DEFAULT_MAX_MEDIA_SIZE_MB * 1024 * 1024) {
      const message = `File size must be ${DEFAULT_MAX_MEDIA_SIZE_MB} MB or less.`;
      setDocumentError(message);
      toast.current?.show({ severity: 'warn', summary: 'Upload', detail: message, life: 3000 });
      return;
    }

    setDocumentFile(file);
    setDocumentName(file.name);
    setDocumentUrl('');
    setDocumentError('');
  };

  const validateTypeFields = (formData) => {
    if (type === 'Content') {
      if (!formData.slug?.trim()) {
        return 'Slug is required';
      }
      if (/\s/.test(formData.slug)) {
        return 'Slug cannot contain spaces';
      }
      if (!content?.trim() || content === '<p><br></p>') {
        setContentError('Content is required');
        return 'Content is required';
      }
    }

    if (type === 'Link') {
      if (!formData.linkUrl?.trim()) {
        setLinkError('Link is required');
        return 'Link is required';
      }
    }

    if (type === 'Document') {
      if (!documentFile && !documentUrl) {
        setDocumentError('Document is required');
        return 'Document is required';
      }
    }

    return null;
  };

  const submit = async (formData) => {
    const typeValidationError = validateTypeFields(formData);
    if (typeValidationError) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation',
        detail: typeValidationError,
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      let uploadedDocumentUrl = documentUrl;
      let uploadedDocumentName = documentName;

      if (type === 'Document' && documentFile) {
        uploadedDocumentUrl = await uploadMediaFile(documentFile, documentUrl);
        uploadedDocumentName = documentFile.name;
      }

      const payload = {
        title: formData.title.trim(),
        type,
        sortOrder: Number(formData.sortOrder),
        status,
        slug: type === 'Content' ? formData.slug.trim() : '',
        content: type === 'Content' ? content : '',
        linkUrl: type === 'Link' ? formData.linkUrl.trim() : '',
        documentUrl: type === 'Document' ? uploadedDocumentUrl : '',
        documentName: type === 'Document' ? uploadedDocumentName : '',
      };

      const response = await axios[id ? 'put' : 'post'](
        id ? `/api/quick-links/${id}` : '/api/quick-links',
        payload
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Could not save quick link');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Quick link ${id ? 'updated' : 'saved'} successfully`,
        life: 2500,
      });
      router.push('/admin/quick-links');
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Could not save quick link',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const slugRegister = register('slug', {
    required: type === 'Content' ? 'Slug is required' : false,
    validate: (value) =>
      type !== 'Content' || !/\s/.test(value || '') || 'Slug cannot contain spaces',
  });

  return (
    <div className="p-[20px] xl:p-[25px] w-full">
      <Toast ref={toast} />

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

          <div className="flex flex-col gap-2">
            <label className={fieldLabelClass}>
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-6">
              {TYPE_OPTIONS.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <RadioButton
                    inputId={`type-${option}`}
                    name="type"
                    value={option}
                    onChange={(e) => {
                      setType(e.value);
                      setContentError('');
                      setLinkError('');
                      setDocumentError('');
                    }}
                    checked={type === option}
                  />
                  <label htmlFor={`type-${option}`} className="cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {type === 'Content' && (
            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>
                Slug <span className="text-red-500">*</span>
              </label>
              <InputText
                className="border rounded-none"
                placeholder="enter-slug"
                {...slugRegister}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  slugRegister.onChange({
                    ...e,
                    target: { ...e.target, value: e.target.value.replace(/\s/g, '') },
                  });
                }}
              />
              {errors.slug?.message && <span className="text-red-500 text-sm">{errors.slug.message}</span>}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>
              Sort Order <span className="text-red-500">*</span>
            </label>
            <InputText
              type="number"
              min="0"
              className="border rounded-none"
              placeholder="Enter sort order"
              {...register('sortOrder', {
                required: 'Sort order is required',
                min: { value: 0, message: 'Sort order cannot be negative' },
              })}
            />
            {errors.sortOrder?.message && (
              <span className="text-red-500 text-sm">{errors.sortOrder.message}</span>
            )}
          </div>

          {type === 'Content' && (
            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>
                Content <span className="text-red-500">*</span>
              </label>
              <TextEditor value={content} setEditorContent={setContent} onChange={handleContentChange} />
              <input type="hidden" {...register('content')} />
              {contentError && <span className="text-red-500 text-sm">{contentError}</span>}
            </div>
          )}

          {type === 'Link' && (
            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>
                Link <span className="text-red-500">*</span>
              </label>
              <InputText
                className="border rounded-none"
                placeholder="https://example.com"
                {...register('linkUrl', { required: type === 'Link' ? 'Link is required' : false })}
                onChange={(e) => {
                  setValue('linkUrl', e.target.value);
                  setLinkError('');
                }}
              />
              {(errors.linkUrl?.message || linkError) && (
                <span className="text-red-500 text-sm">{errors.linkUrl?.message || linkError}</span>
              )}
            </div>
          )}

          {type === 'Document' && (
            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>
                Document Upload <span className="text-red-500">*</span>
              </label>
              <div className="flex border-2 border-[#b9d1ffab] border-dashed bg-[#fffef5] p-4 justify-center group relative cursor-pointer">
                <input
                  type="file"
                  onChange={handleDocumentSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*"
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
                  <p className="text-[#6C768B] mb-3">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[0.750rem] text-[#6C768B] font-semibold mb-4">
                    Document · Max. File Size: {DEFAULT_MAX_MEDIA_SIZE_MB}MB
                  </p>
                  <span className="text-white text-[0.750rem] bg-[#4FB155] border border-[#4FB155] rounded py-2 px-2 inline-block">
                    Browse File
                  </span>
                </div>
              </div>
              {(documentName || documentUrl) && (
                <div className="mt-3 p-3 border flex items-center justify-between gap-3">
                  <span className="text-sm text-[#494E5F] break-all">
                    {documentName || documentUrl}
                  </span>
                  {documentUrl && !documentFile ? (
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primarycolor text-sm whitespace-nowrap"
                    >
                      View
                    </a>
                  ) : null}
                </div>
              )}
              {documentError && <span className="text-red-500 text-sm">{documentError}</span>}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-6">
            <Link href="/admin/quick-links" className="cancelbtn px-4 py-2 leading-none">
              Cancel
            </Link>
            <Button
              type="submit"
              loading={loading}
              className="text-white border bg-primarycolor border-[#af251c] px-4 py-2 rounded-none"
            >
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
