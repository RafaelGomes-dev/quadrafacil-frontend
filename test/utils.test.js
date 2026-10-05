import test from 'node:test';
import assert from 'node:assert/strict';
import { formatarDataLocalISO } from '../src/utils/data.js';
import { normalizarTelefone, validarDadosDoCliente } from '../src/utils/reserva.js';

test('normaliza telefones antes de enviar para a API', () => {
  assert.equal(normalizarTelefone('(41) 99999-9999'), '41999999999');
  assert.equal(normalizarTelefone('41 3333-4444'), '4133334444');
});

test('aceita dados válidos do cliente', () => {
  assert.equal(validarDadosDoCliente('Rafael Maluf', '(41) 99999-9999'), '');
});

test('rejeita nome incompleto', () => {
  assert.match(validarDadosDoCliente('Ra', '(41) 99999-9999'), /nome completo/i);
});

test('rejeita telefone sem DDD ou com quantidade inválida de dígitos', () => {
  assert.match(validarDadosDoCliente('Rafael Maluf', '9999-9999'), /telefone com DDD/i);
  assert.match(validarDadosDoCliente('Rafael Maluf', '419999999999'), /10 ou 11 dígitos/i);
});

test('formata a data pelo calendário local sem deslocar o dia', () => {
  const dataLocal = new Date(2026, 9, 5, 23, 30);
  assert.equal(formatarDataLocalISO(dataLocal), '2026-10-05');
});
