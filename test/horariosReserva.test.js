import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarHorarios,
  intervaloDoHorario,
  parametrosDaReserva,
  intervalosDaReserva,
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

test('agrupa horas seguidas e mantém intervalos separados quando há uma pausa', () => {
  assert.deepEqual(intervalosDaReserva(['15:00', '14:00', '17:00']), [
    '14:00 às 16:00',
    '17:00 às 18:00',
  ]);
  assert.deepEqual(intervalosDaReserva(['08:00', '09:00']), ['08:00 às 10:00']);
  assert.deepEqual(intervalosDaReserva(['22:00', '23:00']), ['22:00 às 24:00']);
  assert.deepEqual(intervalosDaReserva([]), []);
});
import {
  chaveDoItem,
  itensDosParametros,
  parametrosDosItens,
  gruposDosItens,
} from '../src/utils/horariosReserva.js';
test('itens preservam quadra, data e horário em links e agrupamentos', () => {
  const itens = [
    { quadraId: '1', data: '2026-10-19', horario: '14:00' },
    { quadraId: '1', data: '2026-10-19', horario: '15:00' },
    { quadraId: '2', data: '2026-10-19', horario: '15:00' },
    { quadraId: '1', data: '2026-10-20', horario: '16:00' },
  ];
  assert.deepEqual(
    itensDosParametros(new URLSearchParams(parametrosDosItens(itens, { esporte: 'society' }))),
    itens
  );
  assert.equal(gruposDosItens(itens).length, 3);
  assert.equal(gruposDosItens(itens)[0].intervalo, '14:00 às 16:00');
  assert.notEqual(chaveDoItem(itens[1]), chaveDoItem(itens[2]));
});
