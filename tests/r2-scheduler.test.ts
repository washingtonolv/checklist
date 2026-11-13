import { afterEach, expect, it, vi } from "vitest";
import worker from "../cloudflare/retention-worker";

afterEach(() => vi.unstubAllGlobals());
it("calls only the configured HTTPS photo endpoint with its bearer secret", async () => {
  const request = vi.fn().mockResolvedValue(new Response("{}")); vi.stubGlobal("fetch", request);
  await worker.scheduled({}, { APP_URL: "https://checklist.example", PHOTO_RETENTION_CRON_SECRET: "scheduler-secret" });
  const [url, init] = request.mock.calls[0];
  expect(String(url)).toBe("https://checklist.example/api/cron/photos");
  expect(init).toMatchObject({ method: "POST", redirect: "error", headers: { authorization: "Bearer scheduler-secret" } });
});
it("rejects insecure destinations and missing credentials before making requests", async () => {
  const request = vi.fn(); vi.stubGlobal("fetch", request);
  await expect(worker.scheduled({}, { APP_URL: "http://checklist.example", PHOTO_RETENTION_CRON_SECRET: "secret" })).rejects.toThrow();
  await expect(worker.scheduled({}, { APP_URL: "https://checklist.example", PHOTO_RETENTION_CRON_SECRET: "" })).rejects.toThrow();
  expect(request).not.toHaveBeenCalled();
});
it("preserves the preview example and surfaces retention failures", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
  await expect(worker.scheduled({}, { PREVIEW_APP_URL: "https://preview.example", PHOTO_RETENTION_CRON_SECRET: "secret" })).rejects.toThrow("503");
});
