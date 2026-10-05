import test from 'node:test';
import assert from 'node:assert/strict';
import { formatarData, formatarPreco } from '../src/utils/formatadores.js';

test('formata preços em reais com vírgula nos centavos', () => {
  assert.equal(formatarPreco(180).replace(/\s/g, ' '), 'R$ 180,00');
  assert.equal(formatarPreco(99.5).replace(/\s/g, ' '), 'R$ 99,50');
});

test('converte a data da API para o formato brasileiro', () => {
  assert.equal(formatarData('2026-10-10'), '10/10/2026');
});

test('devolve o valor original quando a data não está no formato esperado', () => {
  assert.equal(formatarData('amanhã'), 'amanhã');
});
