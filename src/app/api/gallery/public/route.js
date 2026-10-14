import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Gallery from '../../../models/gallery';

function buildPublicAlbum(doc) {
  const images = Array.isArray(doc.images) ? doc.images : [];
  const thumbnail = images.find((item) => item.isThumbnail);
  const thumbnailUrl = thumbnail?.url || '';

  const insideImages = images
    .filter((item) => !item.isThumbnail || item.addInGallery)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return {
    id: String(doc._id),
    title: doc.title || '',
    description: doc.description || '',
    thumbnailUrl,
    photoCount: insideImages.length,
    images: insideImages.map((item) => ({
      url: item.url,
      title: item.title || doc.title || '',
      description: item.description || '',
      sortOrder: item.sortOrder ?? 0,
    })),
    captions: insideImages.map((item) => item.title || doc.title || ''),
  };
}

export async function GET() {
  try {
    await connectDB();
    const entries = await Gallery.find({ status: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    const data = entries
      .map(buildPublicAlbum)
      .filter((album) => album.thumbnailUrl);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to fetch gallery' },
      { status: 500 }
    );
  }
}
