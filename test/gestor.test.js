import test from 'node:test';
import assert from 'node:assert/strict';
import {
  conflito,
  eventosNoPeriodo,
  precoNoHorario,
  valorDoEvento,
  inicioSemana,
  somarDias,
} from '../src/gestor/model.js';

const quadra = { id: 1, precoHora: 100 };
const dados = { quadras: [quadra], eventos: [], mensalistas: [], regras: [] };
test('conflitos respeitam quadra, data, cancelamento e intervalos adjacentes', () => {
  const eventos = [
    {
      id: 'r1',
      quadraId: 1,
      data: '2026-10-19',
      inicio: '14:00',
      fim: '16:00',
      status: 'confirmada',
    },
  ];
  const item = { quadraId: 1, data: '2026-10-19', inicio: '15:00', fim: '17:00' };
  assert.equal(conflito(eventos, item).id, 'r1');
  assert.equal(conflito(eventos, { ...item, inicio: '16:00' }), undefined);
  assert.equal(conflito(eventos, { ...item, quadraId: 2 }), undefined);
  assert.equal(conflito([{ ...eventos[0], status: 'cancelada' }], item), undefined);
});
test('mensalistas ocupam somente o dia e a vigência, respeitando exceções', () => {
  const d = {
    ...dados,
    mensalistas: [
      {
        id: 'm1',
        quadraId: 1,
        dia: 4,
        inicio: '17:00',
        fim: '18:00',
        de: '2026-10-01',
        ate: '2026-10-31',
        excecoes: ['2026-10-15'],
      },
    ],
  };
  const eventos = eventosNoPeriodo(d, '2026-10-01', '2026-11-05');
  assert.deepEqual(
    eventos.map((e) => e.data),
    ['2026-10-01', '2026-10-08', '2026-10-22', '2026-10-29']
  );
});
test('preço da data prevalece sobre regra semanal e preço padrão', () => {
  const d = {
    ...dados,
    regras: [
      { quadraId: 1, tipo: 'semanal', dia: 1, inicio: '14:00', fim: '18:00', valor: 140 },
      {
        quadraId: 1,
        tipo: 'data',
        data: '2026-10-19',
        inicio: '15:00',
        fim: '16:00',
        valor: 80,
        promocao: true,
      },
    ],
  };
  assert.equal(precoNoHorario(d, quadra, '2026-10-19', '14:00').valor, 140);
  assert.equal(precoNoHorario(d, quadra, '2026-10-19', '15:00').valor, 80);
  assert.equal(precoNoHorario(d, quadra, '2026-10-19', '18:00').valor, 100);
  assert.equal(valorDoEvento(d, quadra, '2026-10-19', '14:00', '16:00'), 220);
});
test('a semana começa na segunda e navega entre meses', () => {
  assert.equal(inicioSemana('2026-10-06'), '2026-10-05');
  assert.equal(inicioSemana('2026-10-11'), '2026-10-05');
  assert.equal(somarDias('2026-10-31', 1), '2026-11-01');
});
