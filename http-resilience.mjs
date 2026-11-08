// Bound concurrent work per process. Never retain an unbounded waiting queue.
export function createResilientHandler(handler, {
  maxActive = 16, livePath = '/api/live', logger = console.error
} = {}) {
  if (!Number.isSafeInteger(maxActive) || maxActive < 1) throw Error('Invalid request limit');
  let active = 0, peak = 0, rejected = 0, failures = 0;
  const reply = (req, res, status, body) => {
    if (res.destroyed || res.writableEnded) return;
    if (res.headersSent) { res.destroy(); return; }
    res.writeHead(status, {'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'no-store', ...(status === 503 ? {'Retry-After':'5'} : {})});
    res.end(req.method === 'HEAD' ? undefined : JSON.stringify(body));
  };
  function listener(req, res) {
    // Liveness checks the process only; dependency readiness remains separate.
    if (['GET','HEAD'].includes(req.method) && req.url?.split('?')[0] === livePath) {
      reply(req,res,200,{status:'alive'}); return;
    }
    if (active >= maxActive) {
      rejected++;
      reply(req,res,503,{error:'Service is busy. Please retry shortly.'}); return;
    }
    active++; peak=Math.max(peak,active);
    let done=false, closed=false, released=false;
    const release = () => {
      if (!released && done && closed) { released=true; active--; }
    };
    const finished = () => { closed=true; res.off('finish',finished); res.off('close',finished); release(); };
    res.once('finish',finished); res.once('close',finished);
    return Promise.resolve().then(()=>handler(req,res)).catch(error=>{
      failures++;
      // Do not log URLs, bodies, credentials or raw dependency error messages.
      try { logger(JSON.stringify({event:'request_failure',type:error?.name || 'Error'})); } catch {}
      try { reply(req,res,503,{error:'Service temporarily unavailable. Please retry.'}); }
      catch { res.destroy(); }
    }).finally(()=>{done=true; if(res.destroyed || res.writableFinished)closed=true; release();});
  }
  listener.metrics=()=>({activeRequests:active,peakRequests:peak,rejectedRequests:rejected,requestFailures:failures,maxActiveRequests:maxActive});
  return listener;
}
