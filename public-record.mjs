// Legacy records without a status were published before explicit status support.
export function isPublicRecord(record) {
  if (!record || record.autosaved || String(record.slug || '').startsWith('autosave-')) return false;
  return ['publish', 'published', 'active', ''].includes(String(record.status || '').toLowerCase());
}
