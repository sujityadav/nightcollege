import FileManagerNode from '@/app/models/fileManagerNode';
import FileManagerYear from '@/app/models/fileManagerYear';

export function getUniqueFileName(baseName, existingNames = []) {
  const trimmed = String(baseName || '').trim();
  if (!trimmed) return trimmed;

  const names = new Set(existingNames.map((name) => String(name).trim()));
  if (!names.has(trimmed)) return trimmed;

  const dotIndex = trimmed.lastIndexOf('.');
  const hasExtension = dotIndex > 0;
  const stem = hasExtension ? trimmed.slice(0, dotIndex) : trimmed;
  const ext = hasExtension ? trimmed.slice(dotIndex) : '';

  let counter = 1;
  let candidate = `${stem}.${counter}${ext}`;
  while (names.has(candidate)) {
    counter += 1;
    candidate = `${stem}.${counter}${ext}`;
  }

  return candidate;
}

export async function resolveUniqueFileName(name, { parentId = null, yearId = null } = {}) {
  const existing = await FileManagerNode.find({
    parentId: parentId || null,
    yearId: yearId || null,
    isTrashed: false,
    type: 'file',
  }).select('name');

  return getUniqueFileName(name, existing.map((node) => node.name));
}

export function decodePathSegments(pathParam) {
  const segments = Array.isArray(pathParam) ? pathParam : [pathParam];
  return segments.map((segment) => decodeURIComponent(String(segment || ''))).filter(Boolean);
}

export async function resolveFileManagerNodeByPath(pathParam) {
  const segments = decodePathSegments(pathParam);
  if (segments.length < 2) return null;

  const fileName = segments[segments.length - 1];
  const folderSegments = segments.slice(0, -1);
  const yearPart = folderSegments[0];

  let yearId = null;
  let parentId = null;
  let remainingFolders = folderSegments.slice(1);

  if (yearPart.toLowerCase() === 'other') {
    yearId = null;
  } else {
    const yearRecord = await FileManagerYear.findOne({ name: yearPart });
    if (!yearRecord) return null;
    yearId = String(yearRecord._id);
  }

  for (const folderName of remainingFolders) {
    const folder = await FileManagerNode.findOne({
      name: folderName,
      type: 'folder',
      parentId: parentId || null,
      yearId: yearId || null,
      isTrashed: false,
    });

    if (!folder) return null;
    parentId = String(folder._id);
  }

  return FileManagerNode.findOne({
    name: fileName,
    type: 'file',
    parentId: parentId || null,
    yearId: yearId || null,
    isTrashed: false,
  });
}

export function buildFileContentApiPath(pathParam) {
  const segments = decodePathSegments(pathParam);
  return `/api/file/content/${segments.map(encodeURIComponent).join('/')}`;
}
