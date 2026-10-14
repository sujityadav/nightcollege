'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { DEFAULT_MAX_MEDIA_SIZE_MB } from '@/app/components/common/MediaUpload';

export function createGalleryTile(overrides = {}) {
  return {
    id: `tile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    file: null,
    previewUrl: '',
    isThumbnail: false,
    addInGallery: false,
    sortOrder: '',
    title: '',
    description: '',
    ...overrides,
  };
}

export function tileShowsDetailFields(tile) {
  if (!tile.isThumbnail) return true;
  return tile.addInGallery;
}

export default function GalleryImageTiles({
  tiles,
  onChange,
  error = '',
  onError,
  titleErrors = {},
}) {
  const inputRefs = useRef({});

  const thumbnailTileId = tiles.find((tile) => tile.isThumbnail)?.id;

  const updateTile = (tileId, patch) => {
    onChange(
      tiles.map((tile) => (tile.id === tileId ? { ...tile, ...patch } : tile))
    );
  };

  const setThumbnail = (tileId) => {
    onChange(
      tiles.map((tile) => {
        if (tile.id === tileId) {
          return { ...tile, isThumbnail: true };
        }
        return {
          ...tile,
          isThumbnail: false,
          addInGallery: false,
        };
      })
    );
  };

  const handleFileSelect = (tileId, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('Please choose an image file.');
      return;
    }

    const maxBytes = DEFAULT_MAX_MEDIA_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      onError?.(`File size must be ${DEFAULT_MAX_MEDIA_SIZE_MB} MB or less.`);
      return;
    }

    updateTile(tileId, {
      file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const removeTile = (tileId) => {
    if (tiles.length <= 1) {
      onChange([createGalleryTile()]);
      return;
    }

    onChange(tiles.filter((tile) => tile.id !== tileId));
  };

  const addTile = () => {
    onChange([...tiles, createGalleryTile()]);
  };

  const fieldLabelClass =
    'text-[#212325] text-[14px] xl:text-[14px] 3xl:text-[0.729vw] font-[500]';

  return (
    <div className="space-y-4">
      <label className={fieldLabelClass}>Images</label>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {tiles.map((tile, index) => {
          // All tiles show Thumbnail until one is chosen; then only that tile keeps the control.
          const showThumbnailOption =
            !thumbnailTileId || tile.id === thumbnailTileId;
          const showDetails = tileShowsDetailFields(tile);

          return (
            <div
              key={tile.id}
              className="rounded-lg border border-[#E7EDF7] bg-[#FAFBFC] p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#19212A]">Image {index + 1}</span>
                {tiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTile(tile.id)}
                    className="cursor-pointer border-0 bg-transparent p-0 text-red-500"
                    title="Remove"
                  >
                    <i className="pi pi-trash" />
                  </button>
                )}
              </div>

              <div className="relative mb-3 flex h-[160px] items-center justify-center overflow-hidden rounded-md border border-dashed border-[#BECDE3] bg-white">
                {tile.previewUrl ? (
                  <Image
                    src={tile.previewUrl}
                    alt={`Preview ${index + 1}`}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                ) : (
                  <span className="text-sm text-[#63799F]">No image selected</span>
                )}
              </div>

              <input
                ref={(el) => {
                  inputRefs.current[tile.id] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFileSelect(tile.id, event)}
              />
              <Button
                type="button"
                label={tile.previewUrl ? 'Change image' : 'Upload image'}
                icon="pi pi-upload"
                className="mb-3 w-full rounded-none border border-[#af251c] bg-white text-primarycolor"
                onClick={() => inputRefs.current[tile.id]?.click()}
              />

              <div className="flex flex-wrap items-center gap-4">
                {showThumbnailOption && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      inputId={`thumb-${tile.id}`}
                      checked={tile.isThumbnail}
                      onChange={(e) => {
                        if (e.checked) {
                          setThumbnail(tile.id);
                        } else {
                          updateTile(tile.id, {
                            isThumbnail: false,
                            addInGallery: false,
                          });
                        }
                      }}
                    />
                    <label htmlFor={`thumb-${tile.id}`} className="text-sm cursor-pointer">
                      Thumbnail
                    </label>
                  </div>
                )}

                {tile.isThumbnail && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      inputId={`gallery-${tile.id}`}
                      checked={tile.addInGallery}
                      onChange={(e) =>
                        updateTile(tile.id, {
                          addInGallery: e.checked === true,
                        })
                      }
                    />
                    <label htmlFor={`gallery-${tile.id}`} className="text-sm cursor-pointer">
                      Add in gallery
                    </label>
                  </div>
                )}
              </div>

              {showDetails && (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className={fieldLabelClass}>Sort order</label>
                    <InputText
                      type="number"
                      min="0"
                      className="border rounded-none"
                      value={tile.sortOrder}
                      onChange={(e) => updateTile(tile.id, { sortOrder: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={fieldLabelClass}>
                      Title <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      className="border rounded-none"
                      value={tile.title}
                      onChange={(e) => updateTile(tile.id, { title: e.target.value })}
                    />
                    {titleErrors[tile.id] && (
                      <span className="text-sm text-red-500">{titleErrors[tile.id]}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={fieldLabelClass}>Description</label>
                    <InputTextarea
                      rows={2}
                      className="border rounded-none w-full"
                      value={tile.description}
                      onChange={(e) => updateTile(tile.id, { description: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <span className="block text-sm text-red-500">{error}</span>}

      <Button
        type="button"
        label="Add more"
        icon="pi pi-plus"
        className="rounded-none border border-[#af251c] bg-white text-primarycolor"
        onClick={addTile}
      />
    </div>
  );
}
