'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import GalleryImageTiles, {
  createGalleryTile,
  tileShowsDetailFields,
} from '@/app/components/common/GalleryImageTiles';
import { uploadMediaFile } from '@/app/components/common/MediaUpload';

function orderImagesForEdit(images) {
  const list = Array.isArray(images) ? [...images] : [];
  const thumbnail = list.find((image) => image.isThumbnail);
  const others = list
    .filter((image) => !image.isThumbnail)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

  if (thumbnail) {
    return [thumbnail, ...others];
  }

  return others.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
}

export default function GalleryFormPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [tiles, setTiles] = useState([createGalleryTile()]);
  const [tilesError, setTilesError] = useState('');
  const [titleErrors, setTitleErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const toast = useRef(null);
  const router = useRouter();
  const galleryId = useSearchParams().get('id');
  const isUpdateMode = Boolean(galleryId);

  useEffect(() => {
    if (!galleryId) return;

    const loadGallery = async () => {
      setPageLoading(true);
      try {
        const response = await axios.get(`/api/gallery/${galleryId}`);
        const entry = response.data?.data;
        if (!entry) throw new Error();

        reset({
          title: entry.title || '',
          description: entry.description || '',
          sortOrder: entry.sortOrder ?? '',
        });

        const loadedTiles = orderImagesForEdit(entry.images).map((image, index) =>
          createGalleryTile({
            id: `existing-${index}-${image.url}`,
            previewUrl: image.url,
            file: null,
            isThumbnail: Boolean(image.isThumbnail),
            addInGallery: Boolean(image.addInGallery),
            sortOrder: image.sortOrder ?? '',
            title: image.title || '',
            description: image.description || '',
          })
        );

        setTiles(loadedTiles.length ? loadedTiles : [createGalleryTile()]);
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load gallery',
          life: 3000,
        });
      } finally {
        setPageLoading(false);
      }
    };

    loadGallery();
  }, [galleryId, reset]);

  const validateTileTitles = () => {
    const nextErrors = {};
    tiles.forEach((tile) => {
      if (tileShowsDetailFields(tile) && !String(tile.title || '').trim()) {
        nextErrors[tile.id] = 'Title is required';
      }
    });
    setTitleErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      throw new Error('Please enter a title for each image');
    }
  };

  const buildImagesPayload = async () => {
    const hasThumbnail = tiles.some((tile) => tile.isThumbnail);
    if (!hasThumbnail) {
      throw new Error('Please mark one image as thumbnail');
    }

    validateTileTitles();

    const images = [];

    for (const tile of tiles) {
      const url = await uploadMediaFile(tile.file, tile.previewUrl);
      if (!url || url.startsWith('blob:')) {
        throw new Error('Each tile must have an uploaded image');
      }

      images.push({
        url,
        isThumbnail: Boolean(tile.isThumbnail),
        addInGallery: Boolean(tile.addInGallery),
        sortOrder: tile.sortOrder === '' ? 0 : Number(tile.sortOrder),
        title: tile.title || '',
        description: tile.description || '',
      });
    }

    return images;
  };

  const onSubmit = async (formData) => {
    setTilesError('');
    setTitleErrors({});
    try {
      setSubmitting(true);
      const images = await buildImagesPayload();

      const payload = {
        title: formData.title,
        description: formData.description || '',
        sortOrder:
          formData.sortOrder === '' || formData.sortOrder === undefined
            ? 0
            : Number(formData.sortOrder),
        images,
      };

      const response = galleryId
        ? await axios.put(`/api/gallery/${galleryId}`, payload)
        : await axios.post('/api/gallery', payload);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Could not save gallery');
      }

      router.push('/admin/gallery');
    } catch (error) {
      const message = error.message || 'Could not save gallery';
      if (
        message.includes('image') ||
        message.includes('thumbnail') ||
        message.includes('title')
      ) {
        setTilesError(message);
      }
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldLabelClass =
    'text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]';

  return (
    <div className="w-full p-[20px] xl:p-[25px]">
      <Toast ref={toast} />
      <div className="mb-3 flex justify-between">
        <h2 className="m-0 text-[22px] font-[700] text-[#19212A]">
          {isUpdateMode ? 'Update' : 'Add'} Gallery
        </h2>
        <Link href="/admin/gallery" className="cancelbtn px-4 py-2 leading-none">
          Back
        </Link>
      </div>
      {pageLoading ? (
        <div className="card-shadow flex min-h-[320px] items-center justify-center bg-white p-[25px]">
          <div className="flex flex-col items-center gap-3 text-[#6C768B]">
            <i className="pi pi-spin pi-spinner text-3xl text-primarycolor" aria-hidden />
            <span>Loading gallery...</span>
          </div>
        </div>
      ) : (
      <form onSubmit={handleSubmit(onSubmit)} className="card-shadow bg-white p-[25px]" noValidate>
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <InputText
              className="border rounded-none"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title?.message && (
              <span className="text-sm text-red-500">{errors.title.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>Description</label>
            <InputTextarea
              rows={3}
              className="w-full border rounded-none"
              {...register('description')}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={fieldLabelClass}>Sort order</label>
            <InputText
              type="number"
              min="0"
              className="border rounded-none"
              {...register('sortOrder', {
                validate: (value) => {
                  if (value === '' || value === undefined || value === null) {
                    return true;
                  }
                  const num = Number(value);
                  if (!Number.isFinite(num) || num < 0) {
                    return 'Sort order cannot be negative';
                  }
                  return true;
                },
              })}
            />
            {errors.sortOrder?.message && (
              <span className="text-sm text-red-500">{errors.sortOrder.message}</span>
            )}
          </div>

          <GalleryImageTiles
            tiles={tiles}
            onChange={(nextTiles) => {
              setTiles(nextTiles);
              setTitleErrors({});
            }}
            titleErrors={titleErrors}
            error={tilesError}
            onError={(message) =>
              toast.current?.show({
                severity: 'warn',
                summary: 'Upload',
                detail: message,
                life: 3000,
              })
            }
          />

          <div className="mt-[30px] flex justify-center gap-6">
            <Link
              href="/admin/gallery"
              className="cancelbtn px-[14px] xl:px-[18px] py-[10px] xl:py-[12px] leading-[100%]"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              loading={submitting}
              className="rounded-none border border-[#af251c] bg-primarycolor px-[14px] xl:px-[18px] py-[10px] xl:py-[12px] leading-[100%] text-white p-button-raised"
            >
              {isUpdateMode ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
      )}
    </div>
  );
}
