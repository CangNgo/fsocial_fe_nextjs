const addPadStart = (number: number) => number.toString().padStart(2, "0");

function adjustTimezone(time: string | Date): Date {
  const date = new Date(time);
  date.setHours(date.getHours() + 7);
  return date;
}

export function dateTimeToNotiTime(time: string): { textTime: string; labelType: number } {
  const previousTime = adjustTimezone(time);
  const currentTime = new Date();
  const diffMs = Number(currentTime) - Number(previousTime);
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return { textTime: "Vừa xong", labelType: 0 };
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return { textTime: `${diffMinutes} phút`, labelType: 0 };
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return { textTime: `${diffHours} giờ`, labelType: 0 };

  const prevDateObj = new Date(
    previousTime.getFullYear(),
    previousTime.getMonth(),
    previousTime.getDate(),
  );
  const currDateObj = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate(),
  );
  const diffDays = Math.floor((Number(currDateObj) - Number(prevDateObj)) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return { textTime: `${diffDays} ngày`, labelType: 1 };
  if (diffDays < 30) return { textTime: `${diffDays} ngày`, labelType: 2 };
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return { textTime: `${diffMonths} tháng`, labelType: 2 };
  return { textTime: `${Math.floor(diffMonths / 12)} năm`, labelType: 2 };
}

export function dateTimeToPostTime(time: string): string {
  const previousTime = adjustTimezone(time);
  const currentTime = new Date();
  const diffMs = Number(currentTime) - Number(previousTime);
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút`;
  if (diffHours < currentTime.getHours()) return `${diffHours} giờ`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (previousTime.toDateString() === yesterday.toDateString())
    return `${addPadStart(previousTime.getHours())}:${addPadStart(previousTime.getMinutes())} hôm qua`;
  if (previousTime.getFullYear() === currentTime.getFullYear())
    return `${addPadStart(previousTime.getHours())}:${addPadStart(previousTime.getMinutes())} ${addPadStart(previousTime.getDate())}/${addPadStart(previousTime.getMonth() + 1)}`;
  return `${addPadStart(previousTime.getHours())}:${addPadStart(previousTime.getMinutes())} ${addPadStart(previousTime.getDate())}/${addPadStart(previousTime.getMonth() + 1)}/${previousTime.getFullYear()}`;
}

export function dateTimeToMessageTime(time: string): string {
  const previousTime = adjustTimezone(time);
  const currentTime = new Date();

  if (previousTime.toDateString() === currentTime.toDateString()) {
    const diffSecond = Math.floor((Number(currentTime) - Number(previousTime)) / 1000);
    if (diffSecond < 60) return "Vừa xong";
    const diffMinutes = Math.floor(diffSecond / 60);
    if (diffMinutes < 60) return `${diffMinutes} phút`;
    return `${addPadStart(previousTime.getHours())}:${addPadStart(previousTime.getMinutes())}`;
  }
  const thisWeekStart = new Date();
  thisWeekStart.setDate(currentTime.getDate() - currentTime.getDay() + 1);
  thisWeekStart.setHours(0, 0, 0, 0);
  if (previousTime >= thisWeekStart) {
    const dayName = previousTime.toLocaleDateString("vi-VN", { weekday: "long" });
    return `${dayName} ${addPadStart(previousTime.getHours())}:${addPadStart(previousTime.getMinutes())}`;
  }
  if (previousTime.getFullYear() === currentTime.getFullYear())
    return `${addPadStart(previousTime.getHours())}:${addPadStart(previousTime.getMinutes())} ${addPadStart(previousTime.getDate())}/${addPadStart(previousTime.getMonth() + 1)}`;
  return `${addPadStart(previousTime.getHours())}:${addPadStart(previousTime.getMinutes())} ${addPadStart(previousTime.getDate())}/${addPadStart(previousTime.getMonth() + 1)}/${previousTime.getFullYear()}`;
}

export function dateClassToISO8601(date: Date): string {
  return `${date.getFullYear()}-${addPadStart(date.getMonth() + 1)}-${addPadStart(date.getDate())}`;
}

export function dateTimeToReportsLabel(dateTime: string): string {
  const time = adjustTimezone(dateTime);
  return `${addPadStart(time.getMonth() + 1)}/${addPadStart(time.getDate())}`;
}

export function timeAgo(dateString: string): string {
  return dateTimeToPostTime(dateString);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${addPadStart(date.getDate())}/${addPadStart(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return `${addPadStart(date.getHours())}:${addPadStart(date.getMinutes())} ${addPadStart(date.getDate())}/${addPadStart(date.getMonth() + 1)}/${date.getFullYear()}`;
}
