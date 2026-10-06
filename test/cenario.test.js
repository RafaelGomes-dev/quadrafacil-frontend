import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HIPOTESES_CONSERVADORAS as h,
  contasDoCenario,
  gerarReservasCenario,
} from '../src/superadmin/cenario.js';
import { contasIniciais } from '../src/superadmin/model.js';
import { CONFIG_FINANCEIRO, resumoNegocio } from '../src/superadmin/negocio.js';
const contas = contasIniciais().contas;
test('cenário conservador usa uma quadra por estabelecimento e não altera planos cadastrados', () => {
  const copia = structuredClone(contas);
  const base = contasDoCenario(contas, h);
  assert.equal(base.length, 14);
  assert.equal(base.filter((c) => c.plano === 'pro').length, 2);
  assert.equal(base.filter((c) => c.plano === 'premium').length, 0);
  assert.equal(base.filter((c) => c.patrocinado).length, 1);
  assert.deepEqual(contas, copia);
  assert.equal(
    contasDoCenario([...contas, { id: 'novo', status: 'ativa', quadras: 0 }], h).length,
    14
  );
});
test('mês gera 78 reservas por quadra com canais, cancelamentos e ids determinísticos', () => {
  const base = contasDoCenario(contas, h);
  const linhas = gerarReservasCenario(base, '2026-10', h);
  assert.equal(linhas.length, 1092);
  assert.equal(linhas.filter((t) => t.canal === 'app').length, 218);
  assert.equal(linhas.filter((t) => t.status === 'cancelada').length, 55);
  assert.equal(new Set(linhas.map((t) => t.id)).size, linhas.length);
  assert.equal(
    new Set(linhas.map((t) => `${t.quadraId}-${t.data}-${t.horario}`)).size,
    linhas.length
  );
  assert.deepEqual(linhas, gerarReservasCenario(base, '2026-10', h));
});
test('financeiro cobra apenas app liquidado, desconta gateway sobre preço mais taxa e separa MRR', () => {
  const base = contasDoCenario(contas, h);
  const linhas = gerarReservasCenario(base, '2026-10', h);
  const r = resumoNegocio(base, linhas, '2026-10-01', '2026-10-31', {
    ...CONFIG_FINANCEIRO,
    gatewayIncluiTaxa: true,
  });
  assert.equal(r.reservasTotais, 1037);
  assert.equal(r.transacoes, 207);
  assert.equal(r.reservasExternas, 830);
  assert.equal(r.volume, 2484000);
  assert.equal(r.taxaPrevista, 248400);
  assert.equal(r.gatewayPrevisto, 81972);
  assert.equal(r.liquidoPrevisto, 166428);
  assert.equal(r.recorrenciaMensal, 24700);
  assert.equal(
    r.liquidoPrevisto + r.recorrenciaMensal - Math.round(r.recorrenciaMensal * 0.03),
    190387
  );
});
test('0% app e 100% cancelamentos não geram comissão', () => {
  const base = contasDoCenario(contas, h);
  for (const extra of [{ percentualApp: 0 }, { cancelamentos: 100 }]) {
    const linhas = gerarReservasCenario(base, '2026-10', { ...h, ...extra });
    assert.equal(resumoNegocio(base, linhas, '2026-10-01', '2026-10-31').taxaPrevista, 0);
  }
});
test('respeita fevereiro e dias do mês e não duplica horário com maior demanda', () => {
  const base = contasDoCenario(contas.slice(0, 1), h);
  const linhas = gerarReservasCenario(base, '2027-02', { ...h, diasAtivos: 31, reservasDia: 10 });
  assert.equal(linhas.length, 280);
  assert.ok(linhas.every((t) => t.data <= '2027-02-28'));
  assert.equal(
    new Set(linhas.map((t) => `${t.quadraId}-${t.data}-${t.horario}`)).size,
    linhas.length
  );
});
