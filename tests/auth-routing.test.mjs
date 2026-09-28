import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('ARROW sign in clears stale center destinations on a bare front-door visit', () => {
  const source = fs.readFileSync('gateway/public/gateway-auth.js', 'utf8');
  assert.match(source, /localStorage\.removeItem\(NEXT_KEY\)/);
  assert.match(source, /A bare visit to the ARROW front door must never reuse an old center/);
});

test('ARROW center guard and sign in share the same Supabase browser storage key', () => {
  const guard = fs.readFileSync('gateway/public/arrow-auth-guard.js', 'utf8');
  assert.match(guard, /sb-cnorozrjugxpanpfmssa-auth-token/);
});
