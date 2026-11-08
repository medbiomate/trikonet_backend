// Share serialized responses only for the explicitly public cache keys.
// Private/account requests never enter this gate.
export function createPublicRequestGate() {
  const pending = new Map();
  const owners = new WeakMap();
  return {
    async waitOrOwn(key, res) {
      while (pending.has(key)) {
        const packet = await pending.get(key).promise;
        if (res.destroyed) return true;
        if (packet) {
          res.writeHead(packet.status, packet.headers);
          res.end(packet.body);
          return true;
        }
      }
      let resolve;
      const entry = {promise: new Promise(done => { resolve = done; })};
      const release = packet => {
        if (pending.get(key) === entry) pending.delete(key);
        owners.delete(res);
        res.off('close', closed);
        resolve(packet);
      };
      const closed = () => release(null);
      pending.set(key, entry);
      owners.set(res, release);
      res.once('close', closed);
      return false;
    },
    complete(res, status, body, headers) {
      owners.get(res)?.(status === 200 ? {status, body, headers} : null);
    }
  };
}
