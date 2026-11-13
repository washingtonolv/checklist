import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// Authenticated pages are dynamic; never cache user data in shared persistent storage.
export default defineCloudflareConfig({ incrementalCache: "dummy", tagCache: "dummy", queue: "dummy" });
