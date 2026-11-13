interface RetentionEnv { PREVIEW_APP_URL: string; PHOTO_RETENTION_CRON_SECRET: string }
export default {
  async scheduled(_event: unknown, env: RetentionEnv) {
    const base = new URL(env.PREVIEW_APP_URL);
    if (base.protocol !== "https:" || !env.PHOTO_RETENTION_CRON_SECRET) throw new Error("Configure isolated preview scheduler.");
    const response = await fetch(new URL("/api/cron/photos", base), {
      method: "POST", headers: { authorization: `Bearer ${env.PHOTO_RETENTION_CRON_SECRET}` },
      redirect: "error", signal: AbortSignal.timeout(60000)
    });
    if (!response.ok) throw new Error(`Photo retention failed: ${response.status}`);
  }
};
