import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

if (process.env.VERCEL_ENV) throw new Error("Workers builds must run outside Vercel.");
const result = spawnSync(process.execPath, ["node_modules/@opennextjs/cloudflare/dist/cli/index.js", "build"], {
  stdio: "inherit", env: { ...process.env, CLOUDFLARE_WORKERS: "true", PHOTO_ENV: "cloudflare-preview", WRANGLER_SEND_METRICS: "false", NEXT_TELEMETRY_DISABLED: "1" }
});
if (result.status !== 0) process.exit(result.status ?? 1);

function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
const bundles = files(".open-next/server-functions").filter(file =>
  !file.includes(`${path.sep}.next${path.sep}`) && !file.includes(`${path.sep}node_modules${path.sep}`) && (file.endsWith(".mjs") || file.endsWith(".js")));
for (const file of bundles) {
  const source = readFileSync(file, "utf8");
  if (/dd-local-development-secret|dd-local-test|gerente@dd\.local|node_modules\/sharp\/lib|require\(["']sharp["']\)|from ["']sharp["']/.test(source)) throw new Error(`Node/demo dependency leaked into Worker: ${file}`);
}
console.log("Workers bundle verified: no local demo backend or native Sharp import.");
