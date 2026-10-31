// A calendar year from the editor's current local date (clamp leap day).
export function oneYearFromToday(now = new Date()) {
  const year = now.getFullYear() + 1;
  const month = now.getMonth();
  const day = Math.min(now.getDate(), new Date(year, month + 1, 0).getDate());
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
export function newJobDates(job, now = new Date()) {
  if (job.id || job.slug) return job;
  const date = oneYearFromToday(now);
  return {...job, deadline: job.deadline || date, expiryDate: job.expiryDate || job.deadline || date};
}
