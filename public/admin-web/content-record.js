// Retry transient API failures while preserving real 404 responses.
export async function fetchContentResponse(fetcher, url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetcher(url, {signal:AbortSignal.timeout(30000)});
      if (response.status >= 500 && attempt === 0) continue;
      return response;
    } catch (error) { if (attempt === 1) throw error; }
  }
}
// Check both sources concurrently; a transient local failure must not hide an imported record.
export async function loadContentRecord(fetcher, base, type, slug) {
  // WordPress stores non-ASCII slug characters as lowercase percent escapes.
  // Browser paths may supply either those escapes or decoded Unicode.
  if (type === 'employer') slug = String(slug).replace(/[^\x00-\x7F]+/g, value => encodeURIComponent(value).toLowerCase()).replace(/%[0-9a-f]{2}/gi, value => value.toLowerCase());
  const encoded = encodeURIComponent(slug);
  const remote = () => fetchContentResponse(fetcher, `${base}/api/wp/${type}?slug=${encoded}`).then(async r => {
    if (!r.ok) throw new Error('Imported content unavailable');
    return (await r.json())[0] || null;
  });
  if (type === 'posts') return remote();
  const local = fetchContentResponse(fetcher, `${base}/api/local/${type === 'employer' ? 'employers' : 'jobs'}/${encoded}`).then(async r => {
    if (r.ok) return r.json();
    if (r.status === 404) return null;
    throw new Error('Saved content unavailable');
  });
  // Start both reads, but a saved override is authoritative: do not wait for
  // a slow imported source after the saved record has already arrived.
  const importedReady = remote().then(value => ({status:'fulfilled',value}), reason => ({status:'rejected',reason}));
  const saved = await local.then(value => ({status:'fulfilled',value}), reason => ({status:'rejected',reason}));
  if (saved.status === 'fulfilled' && saved.value) return saved.value;
  const imported = await importedReady;
  if (saved.status === 'fulfilled' && saved.value) return saved.value;
  if (imported.status === 'fulfilled' && imported.value) return imported.value;
  if (saved.status === 'fulfilled' && imported.status === 'fulfilled') {
    if (type === 'employer') {
      const response = await fetchContentResponse(fetcher, `${base}/api/wp/employer?q=${encodeURIComponent(slug.replace(/-/g, ' '))}&per_page=100`);
      if (!response.ok) throw new Error('Employer lookup temporarily unavailable');
      const nameSlug = value => String(value?.rendered ?? value ?? '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const matches = (await response.json()).filter(record => record.slug !== slug && nameSlug(record.title) === slug);
      if (matches.length === 1) return loadContentRecord(fetcher, base, type, matches[0].slug);
    }
    return null;
  }
  throw new Error('Content temporarily unavailable');
}
