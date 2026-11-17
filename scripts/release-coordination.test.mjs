import assert from 'node:assert/strict';
import { test } from 'node:test';
import { waitForVercel, verifySites } from './release-coordination.mjs';

const sha = 'a'.repeat(40);
const target = 'https://vercel.com/oliver-53fe/checklist/release';
const response = body => ({ status: 200, json: async () => body });
const status = (state, target_url = target) => ({ statuses: [{ context: 'Vercel', state, target_url }] });
function options(sequence, main = sha) {
  return {
    attempts: sequence.length,
    sleep: async () => {},
    request: async url => response(url.includes('/git/ref/') ? { object: { sha: main } } : sequence.shift()),
  };
}

test('waits for the exact Vercel release, ignoring unrelated checks', async () => {
  assert.equal(await waitForVercel(sha, options([
    { statuses: [{ context: 'other', state: 'success' }] }, status('pending'), status('success'),
  ])), target);
});
test('does not publish after a Vercel failure or timeout', async () => {
  await assert.rejects(waitForVercel(sha, options([status('failure')])), /Vercel publication failed/);
  await assert.rejects(waitForVercel(sha, options([status('pending')])), /Timed out/);
});
test('rejects superseded commits, moving refs and other Vercel projects', async () => {
  await assert.rejects(waitForVercel(sha, options([status('success')], 'b'.repeat(40))), /newer release/);
  await assert.rejects(waitForVercel('main'), /exact approved commit/);
  await assert.rejects(waitForVercel(sha, options([status('success', 'https://vercel.com/other/project/123')])), /Unexpected Vercel/);
});
test('checks both public sites and fails on an unhealthy backend', async () => {
  const visited = [];
  await verifySites({ request: async (url, init) => {
    visited.push(url);
    assert.equal(init.redirect, 'manual');
    return { status: url.endsWith('/painel') ? 307 : 200, json: async () => ({ ok: true }) };
  } });
  assert.equal(visited.length, 6);
  assert.equal(new Set(visited.map(url => new URL(url).host)).size, 2);
  await assert.rejects(verifySites({ request: async url => ({
    status: url.endsWith('/painel') ? 307 : 200, json: async () => ({ ok: false }),
  }) }));
});
