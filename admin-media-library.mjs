// Include uploads saved by every editor, not just the media upload screen.
export async function listAdminMedia(pool) {
  const optional = async sql => {
    try { const [rows] = await pool.query(sql); return rows; }
    catch (error) { if (error.code === 'ER_NO_SUCH_TABLE') return []; throw error; }
  };
  const [library, uploads, attachments] = await Promise.all([
    optional('SELECT payload, created_at FROM trikonet_media_library ORDER BY created_at DESC'),
    optional(`SELECT m.id,m.filename,m.mime,OCTET_LENGTH(m.bytes) byte_size,m.created_at,u.public_url FROM trikonet_media m LEFT JOIN trikonet_uploaded_public_media u ON u.checksum=m.id ORDER BY m.created_at DESC`),
    optional(`SELECT p.ID,p.post_title,p.post_name,p.post_date,p.guid,f.meta_value attached_file FROM wp_posts p LEFT JOIN wp_postmeta f ON f.post_id=p.ID AND f.meta_key='_wp_attached_file' WHERE p.post_type='attachment' AND p.post_mime_type LIKE 'image/%' ORDER BY p.post_date DESC,p.ID DESC`)
  ]);
  const publicAttachments = await optional('SELECT attachment_id,public_url,checksum FROM trikonet_public_media');
  const mapped = new Map(publicAttachments.map(row => [String(row.attachment_id), row]));
  const records = library.map(row => ({ ...JSON.parse(row.payload), date: JSON.parse(row.payload).date || row.created_at }));
  for (const row of uploads) records.push({
    id: row.id, title: row.filename, url: row.public_url || `https://api.trikonet.com/media/images/${row.id}/${encodeURIComponent(row.filename)}`,
    size: `${Math.ceil(Number(row.byte_size) / 1024)} KB`, type: 'image', date: row.created_at
  });
  for (const row of attachments) {
    const mapping = mapped.get(String(row.ID));
    const source = String(row.attached_file || row.guid || '');
    const suffix = source.split('?')[0].match(/\.[a-z0-9]+$/i)?.[0] || '.jpg';
    records.push({id: `attachment-${row.ID}`, title: row.post_title || row.post_name,
      url: mapping?.public_url || `https://api.trikonet.com/uploads/media/${row.ID}${suffix}`,
      checksum: mapping?.checksum, type: 'image', date: row.post_date});
  }
  const seen = new Set();
  const seenChecksums = new Set();
  return records.filter(item => {
    const checksum = item.checksum || (/^[a-f0-9]{64}$/.test(String(item.id)) ? item.id : null);
    if (!item.url || seen.has(item.url) || (checksum && seenChecksums.has(checksum))) return false;
    seen.add(item.url); if (checksum) seenChecksums.add(checksum); return true;
  }).sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}
