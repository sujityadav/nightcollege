"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import SubBanner from "../features/sub-banner";

function AlbumCard({ album, onOpen }) {
  const thumbnailUrl = album.thumbnailUrl;
  const inside = album.images || [];
  const previewSecond = inside[0]?.url || thumbnailUrl;
  const previewThird = inside[1]?.url || inside[0]?.url || thumbnailUrl;
  const insideCount = inside.length;

  return (
    <button
      type="button"
      onClick={() => onOpen(album)}
      className="group w-full overflow-hidden rounded-xl border border-[#E7EDF7] bg-white p-2 text-left shadow-[0_5px_20px_rgba(20,58,119,0.10)] transition hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(20,58,119,0.18)] focus:outline-none focus:ring-2 focus:ring-primarycolor"
    >
      <div className="grid h-[190px] grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden rounded-lg sm:h-[220px]">
        <div className="relative col-span-2 row-span-2 overflow-hidden rounded-md">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={`${album.title} preview`}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="relative overflow-hidden rounded-md">
          {previewSecond ? (
            <Image
              src={previewSecond}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="relative overflow-hidden rounded-md">
          {previewThird ? (
            <Image
              src={previewThird}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : null}
          {insideCount > 2 && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#15213a]/70 text-center text-sm font-semibold text-white">
              +{insideCount - 2}
              <br />
              Photos
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 px-2 pb-1 pt-3 text-[#133B79]">
        <i className="pi pi-images text-[25px]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold sm:text-lg">
            {album.title}
          </h2>
          <p className="text-sm text-[#63799F]">
            {insideCount} Photo{insideCount === 1 ? "" : "s"}
          </p>
        </div>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-primarycolor transition group-hover:bg-primarycolor group-hover:text-white"
          aria-hidden="true"
        >
          <i className="pi pi-arrow-right" />
        </span>
      </div>
    </button>
  );
}

export default function ImagesGalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get("/api/gallery/public");
        setAlbums(response.data?.data || []);
      } catch {
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openAlbum = (album) => {
    setActiveIndex(0);
    setSelectedAlbum(album);
  };

  const changeImage = (direction) => {
    if (!selectedAlbum?.images?.length) return;
    setActiveIndex(
      (index) =>
        (index + direction + selectedAlbum.images.length) %
        selectedAlbum.images.length,
    );
  };

  const breadcrumbData = [
    { label: "Home", url: "/" },
    { label: "All Gallery", url: "" },
  ];

  const lightboxImages = selectedAlbum?.images || [];
  const lightboxCaptions = selectedAlbum?.captions || [];

  return (
    <div>
      <SubBanner title="Explore Gallery" breadcrumbData={breadcrumbData} />
      <main className=" py-10 sm:py-12 md:py-16">
        <div className="px300">
          {loading ? (
            <p className="text-center text-[#63799F]">Loading gallery...</p>
          ) : albums.length === 0 ? (
            <p className="text-center text-[#63799F]">No gallery albums yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} onOpen={openAlbum} />
              ))}
            </div>
          )}
        </div>
        <Dialog
          visible={Boolean(selectedAlbum)}
          onHide={() => setSelectedAlbum(null)}
          modal
          dismissableMask
          showHeader={false}
          className="gallery-lightbox-dialog"
          contentClassName="!p-0"
          style={{ width: "min(96vw, 1100px)" }}
        >
          {selectedAlbum && lightboxImages.length === 0 && (
            <div className="bg-[#171717] p-6 text-white">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{selectedAlbum.title}</h2>
                <button
                  type="button"
                  onClick={() => setSelectedAlbum(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Close gallery"
                >
                  <i className="pi pi-times" />
                </button>
              </div>
              <p className="text-white/80">No photos in this album yet.</p>
            </div>
          )}
          {selectedAlbum && lightboxImages.length > 0 && (
            <div className="bg-[#171717] p-3 text-white sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold sm:text-lg">
                    {selectedAlbum.title}
                  </h2>
                  <p className="text-xs text-white/70">
                    {activeIndex + 1} / {lightboxImages.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAlbum(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Close gallery"
                >
                  <i className="pi pi-times" />
                </button>
              </div>
              <div className="relative flex h-[48vh] min-h-[260px] items-center justify-center overflow-hidden bg-black sm:h-[62vh]">
                <Image
                  src={lightboxImages[activeIndex]?.url}
                  alt={
                    lightboxImages[activeIndex]?.title ||
                    lightboxCaptions[activeIndex] ||
                    selectedAlbum.title
                  }
                  fill
                  sizes="96vw"
                  className="object-contain"
                  priority
                />
                <button
                  type="button"
                  onClick={() => changeImage(-1)}
                  className="absolute left-2 flex h-10 w-10 items-center justify-center bg-black/45 text-white hover:bg-black/70 sm:left-4"
                  aria-label="Previous image"
                >
                  <i className="pi pi-angle-left" />
                </button>
                <button
                  type="button"
                  onClick={() => changeImage(1)}
                  className="absolute right-2 flex h-10 w-10 items-center justify-center bg-black/45 text-white hover:bg-black/70 sm:right-4"
                  aria-label="Next image"
                >
                  <i className="pi pi-angle-right" />
                </button>
              </div>
              <p className="mt-3 text-left text-sm font-medium text-white sm:text-base">
                {lightboxImages[activeIndex]?.title ||
                  lightboxCaptions[activeIndex] ||
                  selectedAlbum.title}
              </p>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {lightboxImages.map((image, index) => (
                  <button
                    type="button"
                    key={`${image.url}-${index}`}
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden border-2 ${index === activeIndex ? "border-primarycolor" : "border-transparent opacity-65 hover:opacity-100"}`}
                    aria-label={image.title || lightboxCaptions[index]}
                    title={image.title || lightboxCaptions[index]}
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </Dialog>
      </main>
    </div>
  );
}
