import test from 'node:test';
import assert from 'node:assert/strict';
import { validarHorarioDeFuncionamento } from '../src/utils/quadra.js';

test('aceita horário de funcionamento válido', () => {
  assert.equal(validarHorarioDeFuncionamento({ abertura: '08:00', fechamento: '22:00' }), '');
});

test('exige abertura e fechamento', () => {
  assert.match(validarHorarioDeFuncionamento({ abertura: '', fechamento: '22:00' }), /abertura/);
  assert.match(validarHorarioDeFuncionamento(), /abertura/);
});

test('rejeita fechamento antes ou igual à abertura', () => {
  assert.match(
    validarHorarioDeFuncionamento({ abertura: '22:00', fechamento: '08:00' }),
    /depois da abertura/
  );
  assert.match(
    validarHorarioDeFuncionamento({ abertura: '10:00', fechamento: '10:00' }),
    /depois da abertura/
  );
});
