// Public registrations historically omitted role. They are job-seeker accounts,
// not console administrators or employer accounts.
export function isCandidateAccount(user) {
  const role = String(user.role || '').trim().toLowerCase();
  return !role || ['candidate', 'subscriber', 'job seeker', 'jobseeker'].includes(role);
}
