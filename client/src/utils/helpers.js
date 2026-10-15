// Shared constants and small helper functions used across the app

export const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-10-15T00:00:00.000Z" -> "15 Oct 2026"
// Dates picked in a date input are saved as midnight UTC, so we read the UTC parts
// (otherwise users in some time zones would see the previous day).
export function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// For real timestamps (status history) we show local date + time: "15 Oct 2026, 14:05"
export function formatDateTime(value) {
  const d = new Date(value);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hours}:${minutes}`;
}

// Converts a stored date to "YYYY-MM-DD", the format <input type="date"> needs
export function toInputDate(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

// Today's date as "YYYY-MM-DD" (default value for the applied date field)
export function todayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

// Follow-up rule: still "Applied" AND applied more than 7 days ago
export function needsFollowUp(application) {
  if (application.status !== 'Applied') return false;
  const daysSinceApplied = (Date.now() - new Date(application.appliedDate).getTime()) / ONE_DAY_MS;
  return daysSinceApplied > 7;
}
