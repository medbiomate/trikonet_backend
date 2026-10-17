// Directory cards do not need full HTML descriptions. Detail reads stay intact.
export function summarizeJob(record, { searchable = false } = {}) {
  const plain = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const { description, content, ...card } = record;
  const excerpt = record.excerpt?.rendered || record.excerpt || content?.rendered || content || description;
  return {
    ...card,
    excerpt: plain(excerpt).slice(0, 240),
    ...(searchable ? { searchText: plain([description, content?.rendered || content, record.excerpt?.rendered || record.excerpt].filter(Boolean).join(' ')) } : {})
  };
}
