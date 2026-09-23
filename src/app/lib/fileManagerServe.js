import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryPublicId } from '@/app/lib/cloudinary';
import { getFileManagerViewType } from '@/app/utils/fileManagerDocument';

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

export async function serveFileManagerNode(item, { download = false } = {}) {
  if (!item?.url) {
    return { error: 'File URL not found', status: 404 };
  }

  const viewType = getFileManagerViewType(item.url, item.name);
  if (!viewType) {
    return { error: 'This file type cannot be previewed', status: 400 };
  }

  const publicId = getCloudinaryPublicId(item.url);
  if (!publicId) {
    return { error: 'Invalid file URL', status: 400 };
  }

  ensureCloudinaryConfig();
  const resourceType = getResourceType(item.url);
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
    item.url
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
    return { error: 'Failed to load file', status: 502 };
  }

  const fileName = item.name || 'file';
  const disposition = download ? 'attachment' : 'inline';

  return {
    buffer,
    headers: {
      'Content-Type': getContentType(viewType, fileName),
      'Content-Disposition': `${disposition}; filename="${encodeURIComponent(fileName)}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  };
}
