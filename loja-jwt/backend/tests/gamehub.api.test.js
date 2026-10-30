import test from 'node:test';
import assert from 'node:assert/strict';

import app from '../app.js';

test('API GameHub responde com status da rota principal', async () => {
  const resposta = await fetch('http://localhost:3000/');
  assert.equal(resposta.status, 200);
  const json = await resposta.json();
  assert.ok(json.mensagem);
});
