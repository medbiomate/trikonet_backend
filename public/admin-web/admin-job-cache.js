const prefix = 'trikonet-job-pages-day-scoped-v2:';
const ttl = 24 * 60 * 60 * 1000;
export function createJobPageCache(storage, account) {
  const scope = prefix + encodeURIComponent(account) + ':';
  const keys = () => Array.from({length:storage.length},(_,i)=>storage.key(i)).filter(k=>k?.startsWith(scope));
  return {
    read(query) {
      try {
        const entry = JSON.parse(storage.getItem(scope+query));
        if (!entry || Date.now()-entry.at > ttl || !Array.isArray(entry.payload?.jobs)) return null;
        return entry.payload;
      } catch { return null; }
    },
    write(query,payload) {
      try {
        const entries = keys().map(key=>({key,at:JSON.parse(storage.getItem(key))?.at || 0})).sort((a,b)=>a.at-b.at);
        while(entries.length >= 20) storage.removeItem(entries.shift().key);
        storage.setItem(scope+query,JSON.stringify({at:Date.now(),payload}));
      } catch { /* Cache limits must not interrupt normal loading. */ }
    },
    clear() { try { keys().forEach(key=>storage.removeItem(key)); } catch {} }
  };
}
