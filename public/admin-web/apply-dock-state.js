// Ignore tiny scroll reversals and keep a buffer around the company boundary.
export function createApplyDockState(initialY = 0) {
  let docked = false, low = initialY, high = initialY;
  return ({y, companyBottom, mobile = true}) => {
    if (!mobile || !Number.isFinite(companyBottom) || companyBottom >= 24) {
      docked = false; low = high = y;
    } else if (docked) {
      high = Math.max(high, y);
      if (high - y >= 48) { docked = false; low = y; }
    } else {
      low = Math.min(low, y);
      if (companyBottom <= -24 && y - low >= 32) { docked = true; high = y; }
    }
    return docked;
  };
}
