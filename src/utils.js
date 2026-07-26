export function getTodayIndex() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function getDaysUntil(dateStr) {
  const target = new Date(`${dateStr}T14:00:00`);
  const diff = target - new Date();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function todayKey() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
