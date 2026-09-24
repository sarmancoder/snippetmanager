import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJsonc } from './jsonc.js';

test('parseJsonc handles VS Code snippet JSONC content', () => {
  const content = `EFF{
    // comment
    "hello": {
      "prefix": "hi",
      "body": ["console.log('x')",],
    },
  }`;

  assert.deepEqual(parseJsonc(content), {
    hello: {
      prefix: 'hi',
      body: ["console.log('x')"],
    },
  });
});
