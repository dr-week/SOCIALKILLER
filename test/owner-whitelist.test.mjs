import { test } from 'node:test';
import assert from 'node:assert';
import { isOwnerWorkspace } from '../server/ownerWhitelist.mjs';

test('owner workspace detection works for danger-labs (valid)', () => {
  const brand = { id: 'danger-labs', purpose: { githubUser: 'dr-week' } };
  assert.strictEqual(isOwnerWorkspace(brand), true);
});

test('non‑whitelisted workspace returns false', () => {
  const brand = { id: 'other-brand', purpose: { githubUser: 'someone' } };
  assert.strictEqual(isOwnerWorkspace(brand), false);
});

test('missing githubUser returns false', () => {
  const brand = { id: 'danger-labs', purpose: {} };
  assert.strictEqual(isOwnerWorkspace(brand), false);
});

test('malformed brand object returns false', () => {
  assert.strictEqual(isOwnerWorkspace(null), false);
  assert.strictEqual(isOwnerWorkspace({}), false);
});
