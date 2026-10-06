import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarHorarios,
  intervaloDoHorario,
  parametrosDaReserva,
} from '../src/utils/horariosReserva.js';

test('aceita horários separados, ordena e elimina duplicatas e valores inválidos', () => {
  assert.deepEqual(normalizarHorarios(['17:00', '14:00', '17:00', '24:00', '14:30', null]), [
    '14:00',
    '17:00',
  ]);
});

test('preserva os horários em um link recarregável e suporta o formato antigo', () => {
  const parametros = new URLSearchParams(
    parametrosDaReserva('4', '2026-10-19', ['17:00', '14:00'])
  );
  assert.deepEqual(parametros.getAll('horario'), ['14:00', '17:00']);
  assert.equal(parametros.get('quadraId'), '4');
  assert.deepEqual(normalizarHorarios('14:00'), ['14:00']);
});

test('mostra intervalos de uma hora, incluindo o último horário do dia', () => {
  assert.equal(intervaloDoHorario('14:00'), '14:00 às 15:00');
  assert.equal(intervaloDoHorario('23:00'), '23:00 às 24:00');
});
