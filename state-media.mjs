// Process only changed records. Draft autosaves and account updates must not
// upload every image in the catalogue before they can commit.
export async function prepareStateMedia(db, before, mediaStore) {
  const result = { ...db };
  for (const [key, value] of Object.entries(db)) {
    if (before && JSON.stringify(before[key]) === JSON.stringify(value)) continue;
    if (key === 'jobs' || key === 'employers') {
      const previous = new Map((before?.[key] || []).map(record => [String(record.id || record.slug), record]));
      result[key] = await Promise.all(value.map(async record => {
        const old = previous.get(String(record.id || record.slug));
        if (old && JSON.stringify(old) === JSON.stringify(record)) return record;
        // Persist new embedded bytes; public promotion is handled by explicit
        // media uploads, never by a catalogue write or a public list request.
        return mediaStore.normalize(record, key === 'jobs' ? 'job' : 'employer');
      }));
    } else result[key] = await mediaStore.normalize(value);
  }
  return result;
}
