import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const repository = 'washingtonolv/checklist';
const vercelProject = 'https://vercel.com/oliver-53fe/checklist/';

export async function waitForVercel(sha, {
  request = fetch,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  attempts = 80,
  token = process.env.GH_TOKEN,
} = {}) {
  assert.match(sha ?? '', /^[a-f0-9]{40}$/, 'An exact approved commit is required');
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const get = async path => {
    const response = await request(`https://api.github.com/repos/${repository}/${path}`, {
      headers, signal: AbortSignal.timeout(30000),
    });
    assert.equal(response.status, 200, `GitHub request failed: ${path}`);
    return response.json();
  };
  for (let attempt = 0; attempt < attempts; attempt++) {
    const main = await get('git/ref/heads/main');
    assert.equal(main.object.sha, sha, 'A newer release replaced this commit; rerun the latest release');
    const result = await get(`commits/${sha}/status`);
    const status = result.statuses.find(item => item.context === 'Vercel');
    if (status?.state === 'failure' || status?.state === 'error') {
      throw new Error('Vercel publication failed; Cloudflare was not published');
    }
    if (status?.state === 'success') {
      assert.ok(status.target_url?.startsWith(vercelProject), 'Unexpected Vercel project');
      return status.target_url;
    }
    if (attempt + 1 < attempts) await sleep(15000);
  }
  throw new Error('Timed out waiting for Vercel; Cloudflare was not published');
}

export async function verifySites({ request = fetch } = {}) {
  for (const base of [
    'https://checklist-rosy-eight.vercel.app',
    'https://checklist-dd.checklist-operacional-dd.workers.dev',
  ]) {
    for (const [path, expected] of [['/login', 200], ['/painel', 307], ['/api/health', 200]]) {
      const response = await request(base + path, {
        redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(30000),
      });
      assert.equal(response.status, expected, `${base}${path}`);
      if (path === '/api/health') assert.equal((await response.json()).ok, true, base);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === 'wait') console.log(await waitForVercel(process.argv[3]));
  else if (process.argv[2] === 'verify') await verifySites();
  else throw new Error('Usage: release-coordination.mjs wait <sha> | verify');
}
