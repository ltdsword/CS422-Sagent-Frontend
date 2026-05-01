import { isAxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string") {
      const s = data.trim();
      if (s.length > 0) {
        return s;
      }
    }

    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (typeof obj.detail === "string") {
        return obj.detail;
      }

      const messages = Object.entries(obj).flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => (typeof v === "string" ? `${key}: ${v}` : `${key}: ${String(v)}`));
        }
        if (typeof value === "string") {
          return [`${key}: ${value}`];
        }
        return [];
      });

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
