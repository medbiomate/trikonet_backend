// Enforce the limit while downloading, before creating a large aggregate buffer.
export async function boundedResponseBytes(response, maxBytes) {
  if (Number(response.headers.get('content-length')) > maxBytes) {
    await response.body?.cancel();
    throw Error('Image too large');
  }
  const chunks=[];
  let size=0;
  if (!response.body) throw Error('Image body unavailable');
  for await (const chunk of response.body) {
    size+=chunk.byteLength;
    if (size > maxBytes) throw Error('Image too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks,size);
}
