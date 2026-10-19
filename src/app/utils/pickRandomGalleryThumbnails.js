export const CAMPUS_TOUR_THUMBNAIL_COUNT = 10;

/**
 * Picks `count` random gallery thumbnail URLs from active albums.
 * Duplicates entries when fewer than `count` unique thumbnails exist.
 */
export function pickRandomGalleryThumbnails(albums, count = CAMPUS_TOUR_THUMBNAIL_COUNT) {
  const pool = (albums || [])
    .filter((album) => album?.thumbnailUrl)
    .map((album) => ({
      url: album.thumbnailUrl,
      alt: album.title || 'Campus gallery',
      albumId: album.id,
    }));

  if (!pool.length) return [];

  const picked = [];
  while (picked.length < count) {
    const item = pool[Math.floor(Math.random() * pool.length)];
    picked.push({
      ...item,
      key: `${item.albumId}-${picked.length}`,
    });
  }
  return picked;
}
