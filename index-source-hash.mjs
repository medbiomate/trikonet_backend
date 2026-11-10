import {createHash} from 'node:crypto';

// Preserve the existing index fingerprint without retaining the serialized catalogue.
export function indexSourceHash(source, indexRecord) {
  const hash = createHash('sha256').update('schema-v1').update('[');
  for (let index = 0; index < source.length; index++) {
    if (index > 0) hash.update(',');
    hash.update(JSON.stringify(indexRecord(source[index])));
  }
  return hash.update(']').digest('hex');
}
