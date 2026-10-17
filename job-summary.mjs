// Directory cards do not need full HTML descriptions. Detail reads stay intact.
export function summarizeJob(record, { searchable = false } = {}) {
  const text = value => typeof value === 'string' ? value : typeof value?.rendered === 'string' ? value.rendered : '';
  const plain = value => text(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const { description, content, ...card } = record;
  const excerpt = text(record.excerpt) || text(content) || text(description);
  return {
    ...card,
    excerpt: plain(excerpt).slice(0, 240),
    ...(searchable ? { searchText: plain([description, content, record.excerpt].map(text).filter(Boolean).join(' ')) } : {})
  };
}
