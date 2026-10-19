import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from '../../../../../lib/mongodb';
import NaacAqarDocument from '../../../../../models/naacAqarDocument';
import NaacAqarDocumentRow from '../../../../../models/naacAqarDocumentRow';
import { getCloudinaryPublicId } from '../../../../../lib/cloudinary';
import { getAqarRowDocumentViewType } from '../../../../../utils/aqarRowDocument';

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

function getContentType(viewType, documentName = '') {
  if (viewType === 'pdf') return 'application/pdf';

  const name = documentName.toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.gif')) return 'image/gif';
  if (name.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

export async function GET(req, { params }) {
  try {
    const { rowId } = await params;
    await connectDB();
    const row = await NaacAqarDocumentRow.findById(rowId);

    if (!row || row.linkType !== 'document' || !row.documentUrl) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const document = await NaacAqarDocument.findOne({ _id: row.documentId, status: true }).lean();
    if (!document) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const viewType = getAqarRowDocumentViewType(row.documentUrl, row.documentName);
    if (!viewType) {
      return NextResponse.json(
        { success: false, message: 'This document type cannot be previewed' },
        { status: 400 }
      );
    }

    const publicId = getCloudinaryPublicId(row.documentUrl);
    if (!publicId) {
      return NextResponse.json({ success: false, message: 'Invalid document URL' }, { status: 400 });
    }

    ensureCloudinaryConfig();
    const resourceType = getResourceType(row.documentUrl);

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
      row.documentUrl
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
        { success: false, message: 'Failed to load document file' },
        { status: 502 }
      );
    }

    const fileName = row.documentName || 'document';

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
