import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mapaOcupacao,
  lancamentosDemo,
  resumoFinanceiro,
  precoSugerido,
} from '../src/gestor/relatorios.js';
const quadra = {
  id: 1,
  nome: 'Quadra 1',
  ativa: true,
  precoHora: 100,
  horarioFuncionamento: { abertura: '09:00', fechamento: '22:00' },
};
test('ocupação respeita funcionamento, quadras ativas e soma corretamente a capacidade', () => {
  const mapa = mapaOcupacao([quadra, { ...quadra, id: 2, ativa: false }], 4);
  assert.equal(mapa.capacidade, 13 * 7 * 4);
  assert.equal(mapa.celulas.find((c) => c.hora === 8).percentual, null);
  assert.equal(mapa.celulas.find((c) => c.hora === 22).percentual, null);
  assert.ok(mapa.celulas.every((c) => c.ocupadas <= c.capacidade));
  assert.equal(mapa.ocupacao, Math.round((mapa.ocupadas / mapa.capacidade) * 100));
  assert.equal(mapaOcupacao([], 4).pico, undefined);
});
test('receita do gestor preserva valor da quadra sem comissão ou desconto presencial', () => {
  const r = resumoFinanceiro([
    { valor: 10000, status: 'paga', origem: 'QuadraFácil', tipo: 'avulsa', repasse: 'repassado' },
    { valor: 20000, status: 'paga', origem: 'QuadraFácil', tipo: 'avulsa', repasse: 'previsto' },
    { valor: 10000, status: 'pendente', origem: 'QuadraFácil', tipo: 'avulsa' },
    { valor: 120000, status: 'paga', origem: 'Presencial', tipo: 'mensalidade' },
    { valor: 5000, status: 'paga', origem: 'Presencial', tipo: 'avulsa' },
    { valor: 90000, status: 'cancelada', origem: 'QuadraFácil', tipo: 'avulsa' },
    { valor: 90000, status: 'reembolsada', origem: 'QuadraFácil', tipo: 'avulsa' },
  ]);
  assert.equal(r.bruto, 165000);
  assert.equal(r.recebido, 135000);
  assert.equal(r.pendente, 10000);
  assert.equal(r.repassePendente, 20000);
  assert.equal(r.recebido + r.pendente + r.repassePendente, r.bruto);
  assert.equal(r.mensalidades, 120000);
  assert.equal(r.online + r.direto, r.bruto);
});
test('prévia de desconto e reajuste arredonda para centavos', () => {
  assert.equal(precoSugerido(180, -20), 144);
  assert.equal(precoSugerido(120, 10), 132);
  assert.equal(precoSugerido(99.99, 10), 109.99);
});
test('mensalistas geram um lançamento mensal, não um por ocorrência da agenda', () => {
  const dados = {
    quadras: [quadra],
    mensalistas: [
      {
        id: 'm1',
        cliente: 'Cliente',
        quadraId: 1,
        de: '2026-09-01',
        ate: '2026-12-31',
        valorMensal: 1200,
      },
    ],
  };
  const linhas = lancamentosDemo(dados, '2026-10-06');
  assert.equal(linhas.filter((l) => l.tipo === 'mensalidade').length, 1);
  assert.equal(linhas.find((l) => l.tipo === 'mensalidade').valor, 120000);
  assert.ok(linhas.every((l) => l.data >= '2026-10-01' && l.data <= '2026-10-06'));
  assert.deepEqual(lancamentosDemo({ quadras: [], mensalistas: [] }, '2026-10-06'), []);
});
