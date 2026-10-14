import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Gallery from '../../../models/gallery';

function normalizeImages(images) {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  const normalized = images
    .filter((item) => item?.url?.trim())
    .map((item) => ({
      url: String(item.url).trim(),
      isThumbnail: Boolean(item.isThumbnail),
      addInGallery: Boolean(item.addInGallery),
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : 0,
      title: String(item.title || '').trim(),
      description: String(item.description || '').trim(),
    }));

  if (!normalized.length) {
    return null;
  }

  const thumbnailCount = normalized.filter((item) => item.isThumbnail).length;
  if (thumbnailCount !== 1) {
    return { error: 'Exactly one image must be marked as thumbnail' };
  }

  for (const item of normalized) {
    const needsTitle = !item.isThumbnail || item.addInGallery;
    if (needsTitle && !item.title) {
      return { error: 'Title is required for each gallery image' };
    }
  }

  return { images: normalized };
}

function parseGallerySortOrder(value) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return null;
  }
  return num;
}

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const entry = await Gallery.findById(id);
    if (!entry) {
      return NextResponse.json({ success: false, message: 'Gallery not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to fetch gallery' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const payload = {};

    if (body.title !== undefined) {
      const title = body.title?.trim();
      if (!title) {
        return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
      }
      payload.title = title;
    }

    if (body.description !== undefined) {
      payload.description = String(body.description || '').trim();
    }

    if (body.sortOrder !== undefined) {
      const sortOrder = parseGallerySortOrder(body.sortOrder);
      if (sortOrder === null) {
        return NextResponse.json(
          { success: false, message: 'Sort order cannot be negative' },
          { status: 400 }
        );
      }
      payload.sortOrder = sortOrder;
    }

    if (body.status !== undefined) {
      payload.status = body.status !== false;
    }

    if (body.images !== undefined) {
      const imageResult = normalizeImages(body.images);
      if (!imageResult || imageResult.error) {
        return NextResponse.json(
          {
            success: false,
            message: imageResult?.error || 'At least one image is required',
          },
          { status: 400 }
        );
      }
      payload.images = imageResult.images;
    }

    const entry = await Gallery.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!entry) {
      return NextResponse.json({ success: false, message: 'Gallery not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to update gallery' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const entry = await Gallery.findByIdAndDelete(id);
    if (!entry) {
      return NextResponse.json({ success: false, message: 'Gallery not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Gallery deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to delete gallery' },
      { status: 500 }
    );
  }
}
