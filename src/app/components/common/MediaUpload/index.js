'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { confirmDialog } from 'primereact/confirmdialog';

export const DEFAULT_MAX_MEDIA_SIZE_MB = 15;

/** Normalize any stored/detected type to 'Photo' | 'Video' */
export function normalizeMediaTypeLabel(value) {
  if (!value) return null;
  const v = String(value).toLowerCase();
  if (v === 'video') return 'Video';
  if (v === 'photo' || v === 'image') return 'Photo';
  return null;
}

export function detectMediaType(fileOrUrl) {
  if (fileOrUrl instanceof File) {
    return fileOrUrl.type.startsWith('video/') ? 'Video' : 'Photo';
  }

  if (typeof fileOrUrl === 'string' && fileOrUrl) {
    if (
      fileOrUrl.includes('/video/upload/') ||
      /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(fileOrUrl)
    ) {
      return 'Video';
    }
  }

  return 'Photo';
}

export function isVideoMedia(type) {
  return type === 'Video' || String(type || '').toLowerCase() === 'video';
}

/**
 * Upload a File to /api/upload. Returns the CDN/url string.
 * If no File is provided, returns existingPreviewUrl (or '').
 */
export async function uploadMediaFile(file, existingPreviewUrl = '') {
  if (!(file instanceof File)) return existingPreviewUrl || '';

  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/api/upload', formData);
  const mediaUrl = response.data?.result?.[0]?.url;

  if (!mediaUrl) {
    throw new Error(response.data?.errorMessage || 'Media upload failed');
  }

  return mediaUrl;
}

/** Upload a document file (PDFs stored as raw on Cloudinary). */
export async function uploadDocumentFile(file, existingPreviewUrl = '') {
  return uploadMediaFile(file, existingPreviewUrl);
}

/** Normalize stored photo value (string or array) into a URL array */
export function normalizePhotoList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

/** First image URL from event/news data (supports legacy `photo` string) */
export function getFirstPhotoUrl(data) {
  const fromPhotos = normalizePhotoList(data?.photos);
  if (fromPhotos.length) return fromPhotos[0];
  return typeof data?.photo === 'string' ? data.photo : '';
}

/** Upload multiple media items; keeps existing remote URLs, uploads new Files */
export async function uploadMediaItems(items = []) {
  const urls = [];

  for (const item of items) {
    if (item?.file instanceof File) {
      urls.push(await uploadMediaFile(item.file));
    } else if (item?.previewUrl && !item.previewUrl.startsWith('blob:')) {
      urls.push(item.previewUrl);
    }
  }

  return urls;
}

const createItemId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `media-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const labelClassName =
  'text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]';

/**
 * Shared photo / video upload dropzone + preview.
 *
 * @param {Object} props
 * @param {boolean} [props.allowVideo=false] - true = photo+video (rebranding), false = photo only (news/events)
 * @param {boolean} [props.multiple=false] - true = allow multiple photos (events)
 * @param {boolean} [props.required=false]
 * @param {number} [props.maxSizeMB=15]
 * @param {string} [props.label]
 * @param {string} [props.previewUrl]
 * @param {Array<{ id: string, previewUrl: string, file?: File|null, mediaType?: string }>} [props.items]
 * @param {'Photo'|'Video'|string} [props.mediaType='Photo']
 * @param {File|null} [props.file]
 * @param {string} [props.error]
 * @param {(payload: { file: File|null, previewUrl: string, mediaType: 'Photo'|'Video' }) => void} [props.onChange]
 * @param {(items: Array<{ id: string, previewUrl: string, file?: File|null, mediaType?: string }>) => void} [props.onItemsChange]
 * @param {() => void} [props.onClear]
 * @param {(message: string) => void} [props.onError]
 * @param {boolean} [props.showTypeBadge=false]
 * @param {boolean} [props.confirmRemove=true]
 * @param {string} [props.className]
 */
export default function MediaUpload({
  allowVideo = false,
  multiple = false,
  required = false,
  maxSizeMB = DEFAULT_MAX_MEDIA_SIZE_MB,
  label,
  previewUrl = '',
  items = [],
  mediaType = 'Photo',
  error = '',
  onChange,
  onItemsChange,
  onClear,
  onError,
  showTypeBadge = false,
  confirmRemove = true,
  className = '',
}) {
  const inputRef = useRef(null);
  const maxBytes = maxSizeMB * 1024 * 1024;
  const resolvedLabel =
    label ||
    (multiple
      ? 'Photo Upload (Multiple)'
      : allowVideo
        ? 'Photo/Video Upload'
        : 'Photo Upload');
  const accept = allowVideo ? 'image/*,video/*' : 'image/*';
  const hint = multiple
    ? `Images · Max. File Size: ${maxSizeMB}MB each`
    : allowVideo
      ? `Image or Video · Max. File Size: ${maxSizeMB}MB`
      : `Image · Max. File Size: ${maxSizeMB}MB`;
  const isVideo = isVideoMedia(mediaType);

  const emitError = (message) => {
    onError?.(message);
  };

  const validateFile = (file) => {
    const isImage = file.type.startsWith('image/');
    const isVideoFile = file.type.startsWith('video/');

    if (allowVideo) {
      if (!isImage && !isVideoFile) {
        emitError('Please choose an image or video file.');
        return null;
      }
    } else if (!isImage) {
      emitError('Please choose an image file.');
      return null;
    }

    if (file.size > maxBytes) {
      emitError(`File size must be ${maxSizeMB} MB or less.`);
      return null;
    }

    return {
      file,
      previewUrl: URL.createObjectURL(file),
      mediaType: isVideoFile ? 'Video' : 'Photo',
    };
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = '';
    if (!selectedFiles.length) return;

    if (multiple) {
      const nextItems = [...items];
      for (const file of selectedFiles) {
        const validated = validateFile(file);
        if (!validated) continue;
        nextItems.push({
          id: createItemId(),
          file: validated.file,
          previewUrl: validated.previewUrl,
          mediaType: validated.mediaType,
        });
      }
      if (nextItems.length !== items.length) {
        onItemsChange?.(nextItems);
      }
      return;
    }

    const validated = validateFile(selectedFiles[0]);
    if (!validated) return;

    onChange?.({
      file: validated.file,
      previewUrl: validated.previewUrl,
      mediaType: validated.mediaType,
    });
  };

  const clearMedia = () => {
    onClear?.();
    if (multiple) {
      onItemsChange?.([]);
      return;
    }
    onChange?.({
      file: null,
      previewUrl: '',
      mediaType: 'Photo',
    });
  };

  const removeItem = (itemId) => {
    onItemsChange?.(items.filter((item) => item.id !== itemId));
  };

  const handleRemove = (item) => {
    if (multiple) {
      const itemType = item?.mediaType || 'Photo';
      const itemIsVideo = isVideoMedia(itemType);
      const doRemove = () => removeItem(item.id);

      if (!confirmRemove) {
        doRemove();
        return;
      }

      confirmDialog({
        header: itemIsVideo ? 'Remove Video' : 'Remove Photo',
        message: 'Are you sure you want to remove this image?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Remove',
        rejectLabel: 'Cancel',
        acceptClassName: 'p-button-danger',
        accept: doRemove,
      });
      return;
    }

    if (!confirmRemove) {
      clearMedia();
      return;
    }

    const kind = isVideo ? 'video' : 'photo';
    confirmDialog({
      header: isVideo ? 'Remove Video' : 'Remove Photo',
      message: required
        ? `Are you sure you want to remove this ${kind}? ${
            allowVideo ? 'A photo or video' : 'A photo'
          } is required to save.`
        : `Are you sure you want to remove this ${kind}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remove',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      accept: clearMedia,
    });
  };

  const renderPreview = (url, type, alt = 'Uploaded media') => {
    if (isVideoMedia(type)) {
      return (
        <video
          src={url}
          controls
          className="inline mb-3 max-h-[180px] w-auto rounded"
        />
      );
    }

    return (
      <img
        src={url}
        className="inline mb-3 max-h-[150px] w-auto object-cover"
        alt={alt}
      />
    );
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-1">
        <label className={labelClassName}>
          {resolvedLabel}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <div className="flex border-2 border-[#b9d1ffab] border-dashed bg-[#fffef5] p-4 justify-center group relative cursor-pointer">
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileSelect}
            accept={accept}
            multiple={multiple}
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
              {hint}
            </p>
            <button
              type="button"
              className="text-white text-[0.750rem] xl:text-[0.625vw] bg-[#4FB155] border border-[#4FB155] rounded xl:py-[0.417vw] py-2 xl:px-[0.417vw] px-2 inline-block group-hover:bg-[#3f8643] group-hover:border-[#3f8643] transition duration-300 ease-in-out"
            >
              <i className="rdmark-table-search mr-2"></i>
              Browse File
            </button>
          </div>
        </div>

        {error ? <span className="text-red-500 text-sm">{error}</span> : null}
      </div>

      {multiple && items.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item, index) => (
            <div key={item.id} className="p-2 border flex gap-3 items-start">
              <div className="min-w-0">
                {renderPreview(item.previewUrl, item.mediaType, `Uploaded image ${index + 1}`)}
                {showTypeBadge ? (
                  <div className="text-sm text-[#494E5F]">
                    Type:{' '}
                    <span className="font-medium">
                      {normalizeMediaTypeLabel(item.mediaType) || 'Photo'}
                    </span>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="shrink-0 flex gap-2 items-center bg-[#A0AEC0] text-[#19212A] text-[14px] font-[500] p-[10px] leading-none"
              >
                <i className="pi pi-times-circle"></i> Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {!multiple && previewUrl ? (
        <div className="p-2 border flex gap-5 items-center mt-3">
          <div>
            {renderPreview(previewUrl, mediaType)}
            {showTypeBadge ? (
              <div className="text-sm text-[#494E5F]">
                Type:{' '}
                <span className="font-medium">
                  {normalizeMediaTypeLabel(mediaType) || 'Photo'}
                </span>
              </div>
            ) : null}
          </div>
          <div>
            <button
              type="button"
              onClick={() => handleRemove()}
              className="w-auto flex gap-2 items-center bg-[#A0AEC0] text-[#19212A] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500] p-[10px] xl:p-[10px] 3xl:p-[0.521vw] leading-none"
            >
              <i className="pi pi-times-circle"></i>{' '}
              {isVideo ? 'Remove Video' : 'Remove Photo'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
