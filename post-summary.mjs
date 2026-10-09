export function summarizePost(record) {
  const plain = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    ...record,
    excerpt: { ...record.excerpt, rendered: plain(record.excerpt?.rendered || record.content?.rendered).slice(0, 320) },
    content: { rendered: '', protected: false },
    metas: {}
  };
}
