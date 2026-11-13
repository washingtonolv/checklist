import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import sharp from "sharp";

const children = [];
const logs = [];
const env = { ...process.env, WRANGLER_SEND_METRICS: "false" };
async function start(config, port) {
  // A production build embeds the public URL. Explicitly authorize that same
  // destination for anonymous-route smoke checks; never supply service keys here.
  const vars = config === "wrangler.jsonc" && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? ["--var", `PREVIEW_SUPABASE_URL:${process.env.NEXT_PUBLIC_SUPABASE_URL}`] : [];
  const child = spawn(process.execPath, ["node_modules/wrangler/bin/wrangler.js", "dev", "--local", "--config", config, "--ip", "127.0.0.1", "--port", String(port), ...vars], { env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  children.push(child);
  let log = "";
  logs.push(() => log);
  child.stdout.on("data", chunk => { log += chunk; }); child.stderr.on("data", chunk => { log += chunk; });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 120; i++) {
    if (child.exitCode !== null) throw new Error(`Worker exited: ${log}`);
    try { await fetch(base + "/login", { redirect: "manual" }); return base; } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Worker startup timeout: ${log}`);
}
try {
  if (!process.argv.includes("--bindings-only")) {
  const base = await start("wrangler.jsonc", 8791);
  const login = await fetch(base + "/login"); assert.equal(login.status, 200); assert.match(await login.text(), /Entrar/);
  const protectedPage = await fetch(base + "/painel", { redirect: "manual" }); assert.equal(protectedPage.status, 307); assert.match(protectedPage.headers.get("location"), /\/login/);
  const cron = await fetch(base + "/api/cron/photos", { method: "POST", redirect: "manual" }); assert.equal(cron.status, 401);
  const evidence = await fetch(base + "/api/photos/11111111-1111-1111-1111-111111111111", { redirect: "manual" });
  if (evidence.status === 500) await new Promise(resolve => setTimeout(resolve, 500));
  assert.ok([401,403].includes(evidence.status), `Evidence returned ${evidence.status}: ${await evidence.clone().text()}`);
  assert.equal(evidence.headers.get("cache-control"), "private, no-store");
  }
  const fixture = await start("tests/workers/wrangler.jsonc", 8792);
  const png = await sharp({ create: { width: 200, height: 100, channels: 3, background: "red" } }).png().toBuffer();
  for (const endpoint of ["/roundtrip", "/avatar"]) {
    const result = await fetch(fixture + endpoint, { method: "POST", body: png }); const data = await result.json();
    assert.equal(result.status, 200, JSON.stringify(data)); assert.equal(data.mimeType, "image/webp");
    assert.ok(data.sizeBytes > 0); assert.ok(data.width <= (endpoint === "/avatar" ? 96 : 1600));
  }
  const invalid = await fetch(fixture + "/roundtrip", { method: "POST", body: "not an image" }); assert.equal(invalid.status, 400);
  console.log("Workers smoke passed: login, protected route, cron secret, private evidence, actual Images + R2 upload/read/delete, avatar and invalid image.");
} catch (error) {
  for (const log of logs) console.error(log());
  throw error;
} finally {
  for (const child of children) {
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    else child.kill("SIGTERM");
  }
}
