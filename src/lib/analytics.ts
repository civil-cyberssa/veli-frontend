export type StudentAnalyticsEvent = {
  event_type:
    | "page_view"
    | "session_end"
    | "lesson_viewed"
    | "offer_viewed"
    | "offer_clicked"
    | "request_failed"
    | "application_error";
  duration_ms?: number;
  endpoint?: string;
  http_method?: string;
  http_status?: number;
  error_message?: string;
  error_stack?: string;
  metadata?: Record<string, unknown>;
};

const sessionKey = "veli.student.analytics.session.v1";
let accessToken: string | undefined;

export function setAnalyticsAccessToken(token?: string) {
  accessToken = token;
}

function getSessionId() {
  let value = window.sessionStorage.getItem(sessionKey);
  if (!value) {
    value = crypto.randomUUID();
    window.sessionStorage.setItem(sessionKey, value);
  }
  return value;
}

function analyticsEndpoint() {
  return `${process.env.NEXT_PUBLIC_API_URL ?? ""}/analytics/events/`;
}

export function trackStudentAnalyticsEvent(input: StudentAnalyticsEvent, immediate = false) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    events: [{
      event_id: crypto.randomUUID(),
      event_version: 1,
      source: "student",
      occurred_at: new Date().toISOString(),
      session_id: getSessionId(),
      path: `${window.location.pathname}${window.location.search}`.slice(0, 512),
      page_title: document.title,
      referrer: document.referrer,
      utm_source: "",
      ...input,
    }],
  });
  const endpoint = analyticsEndpoint();
  if (immediate && navigator.sendBeacon && !accessToken) {
    navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
