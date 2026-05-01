import dayjs from "dayjs";

export function getRelativeTimeString(
  date: string | Date,
  isTimed: boolean = false,
): string {
  if (!Intl?.RelativeTimeFormat) {
    return date.toString();
  }

  const rtf = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
    style: "narrow",
  });

  const currentDate = dayjs();
  const targetDate = dayjs(date);
  const diffInMilliseconds = currentDate.valueOf() - targetDate.valueOf();

  const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.round(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24));

  let relativeTime;

  if (diffInMinutes < 60) {
    relativeTime = rtf.format(-diffInMinutes, "minute");
  } else if (diffInHours < 24) {
    relativeTime = rtf.format(-diffInHours, "hour");
  } else if (diffInDays < 7) {
    if (isTimed) {
      relativeTime = dayjs(date).format("ddd h:mm A");
    } else {
      relativeTime = rtf.format(-diffInDays, "day");
    }
  } else if (diffInDays < 30) {
    relativeTime = rtf.format(-Math.round(diffInDays / 7), "week");
  } else if (diffInDays < 365) {
    relativeTime = rtf.format(-Math.round(diffInDays / 30), "month");
  } else {
    if (isTimed) {
      relativeTime = dayjs(date).format("MMM D, YYYY h:mm A");
    } else {
      relativeTime = dayjs(date).format("MMM D, YYYY");
    }
  }

  if (relativeTime === "this minute") {
    return "just now";
  }

  return relativeTime;
}

export function formatShortDate(date: string): string {
  const datetime = dayjs(date);
  return datetime.format("D MMM, YYYY"); // e.g., "13 Jun, 2025"
}

export function formatMonthDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function getCurrentPeriod() {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 12) {
    return "morning";
  } else if (hour < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
}

// 10m, 2h, yesterday, 3d, 2w, 4mo, 1y
export function formatLastMessage(date: Date): string {
  const datetime = dayjs(date);
  const now = dayjs();
  const diffInMinutes = now.diff(datetime, "minute");
  const diffInHours = now.diff(datetime, "hour");
  const diffInDays = now.diff(datetime, "day");
  const diffInWeeks = now.diff(datetime, "week");
  const diffInMonths = now.diff(datetime, "month");
  const diffInYears = now.diff(datetime, "year");

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays === 1) {
    return `yesterday`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  } else {
    return `${diffInYears}y`;
  }
}
