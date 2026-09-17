"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  setAnalyticsAccessToken,
  trackStudentAnalyticsEvent,
} from "@/src/lib/analytics";

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const pageStartedAt = useRef<number | null>(null);
  const previousPath = useRef<string | null>(null);

  useEffect(() => setAnalyticsAccessToken(session?.access), [session?.access]);

  useEffect(() => {
    const now = Date.now();
    if (previousPath.current) {
      trackStudentAnalyticsEvent({
        event_type: "session_end",
        duration_ms: pageStartedAt.current ? now - pageStartedAt.current : 0,
        metadata: { page: previousPath.current },
      });
    }
    previousPath.current = pathname;
    pageStartedAt.current = now;
    trackStudentAnalyticsEvent({ event_type: "page_view" });

  }, [pathname]);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const request = args[0];
      const url = typeof request === "string" ? request : request instanceof URL ? request.href : request.url;
      try {
        const response = await originalFetch(...args);
        if (!response.ok && !url.includes("/analytics/events/")) {
          const method = args[1]?.method ?? (request instanceof Request ? request.method : "GET");
          trackStudentAnalyticsEvent({
            event_type: "request_failed",
            endpoint: url.slice(0, 1000),
            http_method: method,
            http_status: response.status,
            error_message: `API respondeu com status ${response.status}`,
          });
        }
        return response;
      } catch (error) {
        if (!url.includes("/analytics/events/")) {
          trackStudentAnalyticsEvent({
            event_type: "request_failed",
            endpoint: url.slice(0, 1000),
            http_method: args[1]?.method ?? "GET",
            error_message: error instanceof Error ? error.message : String(error),
            error_stack: error instanceof Error ? error.stack : "",
          });
        }
        throw error;
      }
    };

    const onError = (event: ErrorEvent) => trackStudentAnalyticsEvent({
      event_type: "application_error",
      error_message: event.message,
      error_stack: event.error instanceof Error ? event.error.stack : "",
      metadata: { filename: event.filename, line: event.lineno, column: event.colno },
    });
    const onRejection = (event: PromiseRejectionEvent) => trackStudentAnalyticsEvent({
      event_type: "application_error",
      error_message: event.reason instanceof Error ? event.reason.message : String(event.reason),
      error_stack: event.reason instanceof Error ? event.reason.stack : "",
      metadata: { kind: "unhandled_rejection" },
    });
    const onPageHide = () => trackStudentAnalyticsEvent({
      event_type: "session_end",
      duration_ms: pageStartedAt.current ? Date.now() - pageStartedAt.current : 0,
      metadata: { page: previousPath.current },
    }, true);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.fetch = originalFetch;
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  return children;
}
