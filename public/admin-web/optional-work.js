// Optional presentation data gets a small budget; its request can finish later.
export function withOptionalBudget(work, fallback, milliseconds = 200) {
  let timer;
  return Promise.race([
    Promise.resolve(work).catch(() => fallback),
    new Promise(resolve => { timer = setTimeout(() => resolve(fallback), milliseconds); })
  ]).finally(() => clearTimeout(timer));
}
