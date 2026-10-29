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
import { InputSwitch } from 'primereact/inputswitch';
import { Calendar } from 'primereact/calendar';
import TextEditor from '@/app/components/common/editor';
import MediaUpload, {
  uploadDocumentFile,
  DEFAULT_MAX_MEDIA_SIZE_MB,
  detectMediaType,
} from '@/app/components/common/MediaUpload';
import {
  canViewNaacLinkDocumentOnSite,
  getNaacLinkDocumentViewPath,
} from '@/app/utils/naacLinkDocument';
import { slugify, validateSlug } from '@/app/utils/quickLinkSlug';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';
import {
  isNaacQuickLinkSection,
  isIqacMeetingsSection,
  NAAC_QUICK_LINK_SECTIONS,
} from '@/app/features/naac/constants';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

const TYPE_OPTIONS = ['Content', 'Link', 'Document'];

const fieldLabelClass = 'text-[#212325] text-[14px] font-[500]';

const validateLinkUrl = (value) => {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return 'Link is required';
  }

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'Link should be valid';
    }
  } catch {
    return 'Link should be valid';
  }

  return '';
};

export default function NaacLinkFormPage() {
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
  const [documentFile, setDocumentFile] = useState(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentError, setDocumentError] = useState('');
  const [removedDocumentUrl, setRemovedDocumentUrl] = useState('');
  const [contentError, setContentError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [linkError, setLinkError] = useState('');
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meetingDate, setMeetingDate] = useState(null);
  const [meetingDateError, setMeetingDateError] = useState('');
  const [minutesFile, setMinutesFile] = useState(null);
  const [minutesPreview, setMinutesPreview] = useState('');
  const [minutesName, setMinutesName] = useState('');
  const [minutesMediaType, setMinutesMediaType] = useState('File');
  const [minutesError, setMinutesError] = useState('');
  const [actionReportFile, setActionReportFile] = useState(null);
  const [actionReportPreview, setActionReportPreview] = useState('');
  const [actionReportName, setActionReportName] = useState('');
  const [actionReportMediaType, setActionReportMediaType] = useState('File');
  const [actionReportError, setActionReportError] = useState('');

  const toast = useRef(null);
  const slugAutoSyncRef = useRef(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const sectionParam = searchParams.get('section') || '';
  const [loadedSection, setLoadedSection] = useState(sectionParam);
  const section = sectionParam || loadedSection;
  const listHref = isNaacQuickLinkSection(section)
    ? `/admin/naac?section=${section}`
    : '/admin/naac';
  const isEditMode = Boolean(id);
  const isIqacMeetings = isIqacMeetingsSection(section);
  const titleValue = watch('title');
  const slugValue = watch('slug');

  const applySlugFromTitle = (title) => {
    if (title?.trim() && slugAutoSyncRef.current) {
      setValue('slug', slugify(title));
    }
  };

  usePageBreadcrumbs({
    pageTitle: isEditMode ? 'Update Entry' : 'Add Entry',
    breadcrumbs: [
      { label: 'NAAC', href: '/admin/naac' },
      ...(isNaacQuickLinkSection(section)
        ? [{ label: NAAC_QUICK_LINK_SECTIONS[section], href: listHref }]
        : []),
      { label: isEditMode ? 'Update Entry' : 'Add Entry', isCurrent: true },
    ],
  });

  useEffect(() => {
    if (!isEditMode && !isNaacQuickLinkSection(section)) {
      router.replace('/admin/naac');
    }
  }, [isEditMode, section, router]);

  useEffect(() => {
    if (isIqacMeetings) {
      setType('Document');
    }
  }, [isIqacMeetings]);

  useEffect(() => {
    if (type === 'Content' && !isIqacMeetings) {
      applySlugFromTitle(titleValue);
    }
  }, [titleValue, type, isIqacMeetings, setValue]);

  useEffect(() => {
    if (!id) return;

    const loadQuickLink = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/naac-links/${id}`);
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
        setMeetingDate(item.meetingDate ? new Date(item.meetingDate) : null);
        setMinutesPreview(item.minutesDocumentUrl || item.documentUrl || '');
        setMinutesName(item.minutesDocumentName || item.documentName || '');
        setMinutesMediaType(
          detectMediaType(item.minutesDocumentUrl || item.documentUrl || '', { allowAllFiles: true })
        );
        setMinutesFile(null);
        setActionReportPreview(item.actionTakenReportUrl || '');
        setActionReportName(item.actionTakenReportName || '');
        setActionReportMediaType(
          detectMediaType(item.actionTakenReportUrl || '', { allowAllFiles: true })
        );
        setActionReportFile(null);
        setStatus(item.status ?? true);
        setLoadedSection(item.section || sectionParam || '');
        slugAutoSyncRef.current = !(item.slug || '').trim();
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load entry',
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
    setRemovedDocumentUrl('');
    setDocumentError('');
  };

  const handleDocumentDelete = () => {
    if (documentUrl && !documentFile) {
      setRemovedDocumentUrl(documentUrl);
    }
    setDocumentFile(null);
    setDocumentUrl('');
    setDocumentName('');
    setDocumentError('');
  };

  const validateTypeFields = (formData) => {
    if (isIqacMeetings) {
      if (!meetingDate) {
        setMeetingDateError('Meeting date is required');
        return 'Meeting date is required';
      }
      setMeetingDateError('');
      if (!minutesFile && !minutesPreview) {
        setMinutesError('Minutes of action file is required');
        return 'Minutes of action file is required';
      }
      setMinutesError('');
      if (!actionReportFile && !actionReportPreview) {
        setActionReportError('Action taken report file is required');
        return 'Action taken report file is required';
      }
      setActionReportError('');
      return null;
    }

    if (type === 'Content') {
      const slugValidationError = validateSlug(formData.slug);
      if (slugValidationError) {
        setSlugError(slugValidationError);
        return slugValidationError;
      }
      if (!content?.trim() || content === '<p><br></p>') {
        setContentError('Content is required');
        return 'Content is required';
      }
    }

    if (type === 'Link') {
      const linkValidationError = validateLinkUrl(formData.linkUrl);
      if (linkValidationError) {
        setLinkError(linkValidationError);
        return linkValidationError;
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
      if (type !== 'Link' && type !== 'Content') {
        toast.current?.show({
          severity: 'warn',
          summary: 'Validation',
          detail: typeValidationError,
          life: 3000,
        });
      }
      return;
    }

    setLoading(true);
    try {
      let uploadedDocumentUrl = documentUrl;
      let uploadedDocumentName = documentName;
      let minutesDocumentUrl = minutesPreview;
      let minutesDocumentName = minutesName;
      let actionTakenReportUrl = actionReportPreview;
      let actionTakenReportName = actionReportName;

      if (isIqacMeetings) {
        minutesDocumentUrl = await uploadDocumentFile(minutesFile, minutesPreview);
        minutesDocumentName = minutesFile?.name || minutesName || '';
        actionTakenReportUrl = await uploadDocumentFile(actionReportFile, actionReportPreview);
        actionTakenReportName = actionReportFile?.name || actionReportName || '';
        uploadedDocumentUrl = minutesDocumentUrl;
        uploadedDocumentName = minutesDocumentName;
      } else if (type === 'Document' && documentFile) {
        uploadedDocumentUrl = await uploadDocumentFile(documentFile, documentUrl);
        uploadedDocumentName = documentFile.name;
      }

      if (removedDocumentUrl && removedDocumentUrl !== uploadedDocumentUrl) {
        try {
          await axios.delete('/api/upload', { data: { url: removedDocumentUrl } });
        } catch (cleanupError) {
          console.warn('Old document cleanup warning:', cleanupError);
        }
      }

      const payload = {
        title: formData.title.trim(),
        type: isIqacMeetings ? 'Document' : type,
        section,
        sortOrder: Number(formData.sortOrder),
        status,
        slug: type === 'Content' ? formData.slug.trim() : '',
        content: type === 'Content' ? content : '',
        linkUrl: type === 'Link' ? formData.linkUrl.trim() : '',
        documentUrl: type === 'Document' || isIqacMeetings ? uploadedDocumentUrl : '',
        documentName: type === 'Document' || isIqacMeetings ? uploadedDocumentName : '',
        meetingDate: isIqacMeetings && meetingDate ? meetingDate.toISOString() : '',
        minutesDocumentUrl: isIqacMeetings ? minutesDocumentUrl : '',
        minutesDocumentName: isIqacMeetings ? minutesDocumentName : '',
        actionTakenReportUrl: isIqacMeetings ? actionTakenReportUrl : '',
        actionTakenReportName: isIqacMeetings ? actionTakenReportName : '',
      };

      const response = await axios[id ? 'put' : 'post'](
        id ? `/api/naac-links/${id}` : '/api/naac-links',
        payload
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Could not save entry');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Entry ${id ? 'updated' : 'saved'} successfully`,
        life: 2500,
      });
      router.push(listHref);
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      if (apiMessage?.toLowerCase().includes('slug')) {
        setSlugError(apiMessage);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: apiMessage || error.message || 'Could not save entry',
          life: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const slugRegister = register('slug');

  const linkUrlRegister = register('linkUrl');

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
            {isIqacMeetings ? (
              <p className="text-sm text-[#494E5F]">Document (Minutes &amp; Action Taken Report)</p>
            ) : (
            <div className="flex flex-wrap gap-6">
              {TYPE_OPTIONS.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <RadioButton
                    inputId={`type-${option}`}
                    name="type"
                    value={option}
                    onChange={(e) => {
                      const newType = e.value;
                      setType(newType);
                      setContentError('');
                      setSlugError('');
                      setLinkError('');
                      setDocumentError('');
                      if (newType === 'Content') {
                        if (!slugValue?.trim()) {
                          slugAutoSyncRef.current = true;
                        }
                        applySlugFromTitle(titleValue);
                      }
                    }}
                    checked={type === option}
                  />
                  <label htmlFor={`type-${option}`} className="cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            )}
          </div>

          {isIqacMeetings && (
            <>
              <div className="flex flex-col gap-1">
                <label className={fieldLabelClass}>
                  Meeting Date <span className="text-red-500">*</span>
                </label>
                <Calendar
                  value={meetingDate}
                  onChange={(e) => {
                    setMeetingDate(e.value);
                    setMeetingDateError('');
                  }}
                  dateFormat="dd M yy"
                  showIcon
                  className="w-full border rounded-none"
                  placeholder="Select meeting date"
                />
                {meetingDateError && <span className="text-red-500 text-sm">{meetingDateError}</span>}
              </div>

              <MediaUpload
                required
                allowAllFiles
                label="Minutes of Action"
                maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB}
                previewUrl={minutesPreview}
                mediaType={minutesMediaType}
                file={minutesFile}
                fileName={minutesName}
                error={minutesError}
                onChange={({ file, previewUrl, mediaType }) => {
                  setMinutesFile(file);
                  setMinutesPreview(previewUrl);
                  if (file?.name) setMinutesName(file.name);
                  if (mediaType) setMinutesMediaType(mediaType);
                  setMinutesError('');
                }}
                onClear={() => {
                  setMinutesFile(null);
                  setMinutesPreview('');
                  setMinutesName('');
                  setMinutesMediaType('File');
                  setMinutesError('');
                }}
                onError={(message) => {
                  setMinutesError(message);
                  toast.current?.show({ severity: 'warn', summary: 'Upload', detail: message, life: 3000 });
                }}
              />

              <MediaUpload
                required
                allowAllFiles
                label="Action Taken Report"
                maxSizeMB={DEFAULT_MAX_MEDIA_SIZE_MB}
                previewUrl={actionReportPreview}
                mediaType={actionReportMediaType}
                file={actionReportFile}
                fileName={actionReportName}
                error={actionReportError}
                onChange={({ file, previewUrl, mediaType }) => {
                  setActionReportFile(file);
                  setActionReportPreview(previewUrl);
                  if (file?.name) setActionReportName(file.name);
                  if (mediaType) setActionReportMediaType(mediaType);
                  setActionReportError('');
                }}
                onClear={() => {
                  setActionReportFile(null);
                  setActionReportPreview('');
                  setActionReportName('');
                  setActionReportMediaType('File');
                  setActionReportError('');
                }}
                onError={(message) => {
                  setActionReportError(message);
                  toast.current?.show({ severity: 'warn', summary: 'Upload', detail: message, life: 3000 });
                }}
              />
            </>
          )}

          {type === 'Content' && !isIqacMeetings && (
            <div className="flex flex-col gap-1">
              <label className={fieldLabelClass}>
                Slug <span className="text-red-500">*</span>
              </label>
              <InputText
                className="border rounded-none"
                placeholder="enter-slug"
                {...slugRegister}
                onChange={(e) => {
                  setSlugError('');
                  const value = e.target.value.replace(/[^a-zA-Z-]/g, '');
                  slugAutoSyncRef.current = !value.trim();
                  slugRegister.onChange({
                    ...e,
                    target: { ...e.target, value },
                  });
                  if (!value.trim() && titleValue?.trim()) {
                    applySlugFromTitle(titleValue);
                  }
                }}
              />
              {slugError && <span className="text-red-500 text-sm">{slugError}</span>}
              {!slugError && id && watch('slug') && (
                <Link
                  href={`/naac/page/${watch('slug')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primarycolor text-sm"
                >
                  View page
                </Link>
              )}
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
                {...linkUrlRegister}
                onChange={(e) => {
                  setLinkError('');
                  linkUrlRegister.onChange(e);
                }}
              />
              {(linkError) && (
                <span className="text-red-500 text-sm">{linkError}</span>
              )}
            </div>
          )}

          {type === 'Document' && !isIqacMeetings && (
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
              {(documentName || documentUrl || documentFile) && (
                <div className="mt-3 p-3 border flex items-center justify-between gap-3">
                  <span className="text-sm text-[#494E5F] break-all">
                    {documentName || documentUrl}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    {documentUrl && !documentFile && canViewNaacLinkDocumentOnSite(documentUrl, documentName) && id ? (
                      status ? (
                        <Link
                          href={getNaacLinkDocumentViewPath(id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primarycolor text-sm whitespace-nowrap"
                        >
                          View on site
                        </Link>
                      ) : (
                        <span className="text-amber-700 text-sm whitespace-nowrap" title="Turn on Active status to publish this page">
                          Inactive on site
                        </span>
                      )
                    ) : null}
                    {documentUrl && !documentFile && !canViewNaacLinkDocumentOnSite(documentUrl, documentName) ? (
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primarycolor text-sm whitespace-nowrap"
                      >
                        Download
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleDocumentDelete}
                      className="text-red-500 text-sm whitespace-nowrap bg-transparent border-0 cursor-pointer p-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
              {documentError && <span className="text-red-500 text-sm">{documentError}</span>}
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className={fieldLabelClass}>Status</label>
            <InputSwitch checked={status} onChange={(e) => setStatus(e.value)} />
            <span className="text-sm text-[#6C768B]">{status ? 'Active' : 'Inactive'}</span>
          </div>

          <div className="mt-6 flex justify-center gap-6">
            <Link href={listHref} className="cancelbtn px-4 py-2 leading-none">
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
