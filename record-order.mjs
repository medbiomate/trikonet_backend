// Sort a copy: pagination and filters must never mutate the shared dataset.
export function newestFirst(records) {
  const timestamp = record => {
    const value = String(record.date || '').replace(' ', 'T');
    const time = Date.parse(value);
    return Number.isFinite(time) ? time : 0;
  };
  return [...records].sort((a, b) => timestamp(b) - timestamp(a) || Number(b.id || 0) - Number(a.id || 0));
}
