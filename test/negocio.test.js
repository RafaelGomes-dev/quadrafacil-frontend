import test from 'node:test';
import assert from 'node:assert/strict';
import { resumoNegocio } from '../src/superadmin/negocio.js';

test('planos e patrocinados contam somente contas ativas e tratam dados antigos', () => {
  const resumo = resumoNegocio(
    [
      { status: 'ativa' },
      { status: 'ativa', plano: 'premium', patrocinado: true },
      { status: 'revogada', plano: 'pro', patrocinado: true },
    ],
    [],
    '2026-10-01',
    '2026-10-06'
  );
  assert.deepEqual(resumo.planos, { freemium: 1, pro: 0, premium: 1 });
  assert.equal(resumo.patrocinados, 1);
});
test('comissão distingue pagamento pendente e exclui cancelamentos, reembolsos e outras datas', () => {
  const transacoes = [
    { data: '2026-10-06', valor: 18000, status: 'paga' },
    { data: '2026-10-06', valor: 12000, status: 'pendente' },
    { data: '2026-10-06', valor: 9000, status: 'cancelada' },
    { data: '2026-10-06', valor: 10000, status: 'reembolsada' },
    { data: '2026-09-30', valor: 50000, status: 'paga' },
  ];
  const r = resumoNegocio([], transacoes, '2026-10-01', '2026-10-06');
  assert.equal(r.periodo.length, 4);
  assert.equal(r.transacoes, 2);
  assert.equal(r.pagas, 1);
  assert.equal(r.volume, 30000);
  assert.equal(r.taxaPaga, 1800);
  assert.equal(r.taxaPendente, 1200);
  assert.equal(r.taxaPrevista, 3000);
});
test('comissão arredonda cada transação em centavos e período vazio zera valores', () => {
  const t = [{ data: '2026-10-06', valor: 10005, status: 'paga' }];
  assert.equal(resumoNegocio([], t, '2026-10-06', '2026-10-06').taxaPaga, 1001);
  assert.equal(resumoNegocio([], t, '2026-10-07', '2026-10-07').taxaPrevista, 0);
});
test('gateway incide no valor total e sai da comissão, separando confirmado e previsto', () => {
  const r = resumoNegocio(
    [],
    [
      { data: '2026-10-06', valor: 10000, status: 'paga' },
      { data: '2026-10-06', valor: 20000, status: 'pendente' },
      { data: '2026-10-06', valor: 90000, status: 'reembolsada' },
    ],
    '2026-10-06',
    '2026-10-06',
    { gatewayPercentual: 3, pro: 9900, premium: 19900, patrocinio: 4900 }
  );
  assert.equal(r.taxaPrevista, 3000);
  assert.equal(r.gatewayPrevisto, 900);
  assert.equal(r.liquidoPrevisto, 2100);
  assert.equal(r.gatewayPago, 300);
  assert.equal(r.liquidoPago, 700);
});
test('recorrência soma planos e patrocínio independente, excluindo revogados', () => {
  const r = resumoNegocio(
    [
      { status: 'ativa', plano: 'freemium', patrocinado: true },
      { status: 'ativa', plano: 'pro' },
      { status: 'ativa', plano: 'premium', patrocinado: true },
      { status: 'revogada', plano: 'premium', patrocinado: true },
    ],
    [],
    '2026-10-01',
    '2026-10-06',
    { gatewayPercentual: 3, pro: 9900, premium: 19900, patrocinio: 4900 }
  );
  assert.deepEqual(r.receitaPlanos, { freemium: 0, pro: 9900, premium: 19900 });
  assert.equal(r.receitaPatrocinio, 9800);
  assert.equal(r.recorrenciaMensal, 39600);
  assert.equal(r.liquidoPrevisto, 0);
});
