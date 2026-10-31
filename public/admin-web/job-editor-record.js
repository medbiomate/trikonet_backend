// Saved imports can retain WordPress objects even after becoming local records.
export function jobEditorRecord(record, mapImported) {
  const imported = mapImported(record);
  const result = {...imported, ...record};
  const text = value => typeof value === 'string' ? value :
    typeof value?.rendered === 'string' ? value.rendered :
    typeof value?.raw === 'string' ? value.raw : '';
  result.title = text(record.title);
  result.description = text(record.description ?? record.content ?? imported.description);
  result.excerpt = text(record.excerpt ?? imported.excerpt);
  for (const [key,value] of Object.entries(imported)) {
    if (result[key] == null) result[key] = value;
  }
  return result;
}
