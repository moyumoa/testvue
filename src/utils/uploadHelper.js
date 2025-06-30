export const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'audio/mp3',
  'audio/mpeg'
];

export const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.mp3'];
export const NOT_ALLOWED_EXTS = ['.zip', '.rar', '.7z'];

export function filterFiles(files) {
  return Array.from(files).filter((f) => {
    const lowerName = f.name.toLowerCase();
    const isCompressed = NOT_ALLOWED_EXTS.some((ext) => lowerName.endsWith(ext));
    const isAllowedType =
      ALLOWED_TYPES.includes(f.type) ||
      ALLOWED_EXTS.some((ext) => lowerName.endsWith(ext));
    return !isCompressed && isAllowedType;
  });
}

export function createFileInfo(file) {
  return {
    name: file.name,
    size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
    type: file.type,
    status: null,
    catalogue: file.path || '',
    path: file.path,
    ossUrl: undefined,
    hasAssociatedSubTask: false
  };
}