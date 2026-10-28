import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from '@/app/lib/mongodb';
import StudentCorner from '@/app/models/studentCorner';
import { getCloudinaryPublicId } from '@/app/lib/cloudinary';
import { normalizeStudentCornerAttachments } from '@/app/lib/studentCornerData';
import { getQuickLinkDocumentViewType } from '@/app/utils/quickLinkDocument';

function ensureCloudinaryConfig() {
  const strip = (value) => String(value || '').trim().replace(/^['"]|['"]$/g, '');
  cloudinary.config({
    cloud_name: strip(process.env.CLOUDARY_CLOUD_NAME),
    api_key: strip(process.env.CLOUDARY_KEY),
    api_secret: strip(process.env.CLOUDARY_SECRET),
    secure: true,
  });
}

function getResourceType(url = '') {
  if (url.includes('/raw/upload/')) return 'raw';
  if (url.includes('/video/upload/')) return 'video';
  return 'image';
}

function getContentType(viewType, fileName = '') {
  if (viewType === 'pdf') return 'application/pdf';

  const name = fileName.toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.gif')) return 'image/gif';
  if (name.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

export async function GET(_req, { params }) {
  try {
    const { id, fileIndex: fileIndexParam } = await params;
    const fileIndex = Number(fileIndexParam);
    if (Number.isNaN(fileIndex) || fileIndex < 0) {
      return NextResponse.json({ success: false, message: 'Invalid file index' }, { status: 400 });
    }

    await connectDB();
    const item = await StudentCorner.findOne({ _id: id, status: { $ne: false } }).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const files = normalizeStudentCornerAttachments(item);
    const file = files[fileIndex];
    if (!file?.url) {
      return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 });
    }

    const viewType = getQuickLinkDocumentViewType(file.url, file.fileName);
    if (!viewType) {
      return NextResponse.json(
        { success: false, message: 'This file type cannot be previewed' },
        { status: 400 }
      );
    }

    const publicId = getCloudinaryPublicId(file.url);
    if (!publicId) {
      return NextResponse.json({ success: false, message: 'Invalid file URL' }, { status: 400 });
    }

    ensureCloudinaryConfig();
    const resourceType = getResourceType(file.url);
    const fileName = file.fileName || 'document';

    const candidateUrls = [];

    try {
      const resource = await cloudinary.api.resource(publicId, { resource_type: resourceType });
      if (resource?.secure_url) {
        candidateUrls.push(resource.secure_url);
      }
    } catch (resourceError) {
      console.warn('Cloudinary resource lookup failed:', resourceError?.message || resourceError);
    }

    candidateUrls.push(
      cloudinary.url(publicId, {
        resource_type: resourceType,
        type: 'upload',
        sign_url: true,
        secure: true,
        ...(viewType === 'pdf' ? { format: 'pdf' } : {}),
      }),
      cloudinary.utils.private_download_url(publicId, viewType === 'pdf' ? 'pdf' : null, {
        resource_type: resourceType,
        type: 'upload',
        expires_at: Math.round(Date.now() / 1000) + 3600,
      }),
      file.url
    );

    let buffer = null;

    for (const url of candidateUrls) {
      const fileResponse = await fetch(url);
      if (!fileResponse.ok) continue;

      const nextBuffer = await fileResponse.arrayBuffer();
      if (viewType === 'pdf') {
        const header = new TextDecoder().decode(nextBuffer.slice(0, 5));
        if (!header.startsWith('%PDF-')) continue;
      }

      buffer = nextBuffer;
      break;
    }

    if (!buffer) {
      return NextResponse.json(
        { success: false, message: 'Failed to load file' },
        { status: 502 }
      );
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': getContentType(viewType, fileName),
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
