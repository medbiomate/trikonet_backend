export function jobWorkCredit(job) {
  const creator = job.createdBy?.name || '';
  const editor = job.updatedBy?.name || '';
  const first = Date.parse(job.emsFirstPublishedAt || job.createdAt || '');
  const edited = Date.parse(job.updatedBy?.at || '');
  const hasEdit = editor && Number.isFinite(edited) && (!Number.isFinite(first) || edited > first);
  return {primary:hasEdit ? `Edited by: ${editor}` : creator ? `Created by: ${creator}` : 'Creator not recorded',
    original:hasEdit && creator && String(job.createdBy.id) !== String(job.updatedBy.id) ? `Originally created by: ${creator}` : ''};
}
