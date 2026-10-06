import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIG_PROPOSTA as config,
  CENARIO_PROPOSTA as h,
  configurarProposta,
  contasDaProposta,
  reservasDaProposta,
  valoresDaReserva,
  resumoProposta,
} from '../src/superadmin/proposta.js';
import { contasIniciais } from '../src/superadmin/model.js';

test('nova proposta preserva operação salva, mas não herda preços e adesão dos três planos antigos', () => {
  const antiga = {
    premium: 19900,
    patrocinio: 4900,
    cenario: { reservasDia: 4, percentualPro: 80, percentualPremium: 20 },
  };
  const nova = configurarProposta(antiga);
  assert.equal(nova.crescimento, 79900);
  assert.equal(nova.patrocinio, 10000);
  assert.equal(nova.cenario.reservasDia, 4);
  assert.equal(nova.cenario.percentualPro, 0);
  assert.equal(nova.cenario.percentualPremium, 10);
  assert.equal(
    configurarProposta({
      ...antiga,
      proposta: { crescimento: 60000, cenario: { percentualPix: 80 } },
    }).crescimento,
    60000
  );
  assert.equal(antiga.cenario.percentualPro, 80);
});
test('dois planos na projeção, com patrocínio independente e sem editar gestores', () => {
  const contas = contasIniciais().contas;
  const copia = structuredClone(contas);
  const base = contasDaProposta(contas, h);
  assert.equal(base.length, 14);
  assert.equal(base.filter((c) => c.plano === 'freemium').length, 13);
  assert.equal(base.filter((c) => c.plano === 'premium').length, 1);
  assert.equal(base.filter((c) => c.patrocinado).length, 1);
  const atuais = contasDaProposta(contas, h, true);
  assert.ok(atuais.every((c) => ['freemium', 'premium'].includes(c.plano)));
  assert.deepEqual(contas, copia);
});
test('Pix e cartão descontam seus próprios gateways e externos/cancelamentos não geram taxa', () => {
  const t = { canal: 'app', valor: 12000, status: 'paga' };
  assert.deepEqual(valoresDaReserva({ ...t, pagamento: 'pix' }, config), {
    percentual: 5,
    taxa: 600,
    gateway: 199,
    liquido: 401,
  });
  assert.deepEqual(valoresDaReserva({ ...t, pagamento: 'cartao' }, config), {
    percentual: 10,
    taxa: 1200,
    gateway: 445,
    liquido: 755,
  });
  for (const extra of [{ canal: 'whatsapp' }, { status: 'cancelada' }, { status: 'reembolsada' }]) {
    assert.equal(valoresDaReserva({ ...t, pagamento: 'pix', ...extra }, config).taxa, 0);
    assert.equal(valoresDaReserva({ ...t, pagamento: 'pix', ...extra }, config).gateway, 0);
  }
});
test('simulação mantém volume conservador e reconcilia taxas por meio com extrato e MRR', () => {
  const contas = contasDaProposta(contasIniciais().contas, h);
  const linhas = reservasDaProposta(contas, '2026-10', h);
  assert.deepEqual(linhas, reservasDaProposta(contas, '2026-10', h));
  assert.equal(linhas.length, 1092);
  const app = linhas.filter((t) => t.canal === 'app');
  assert.equal(app.length, 218);
  assert.equal(app.filter((t) => t.pagamento === 'pix').length, 152);
  const r = resumoProposta(contas, linhas, '2026-10-01', '2026-10-31', config);
  assert.equal(r.transacoes, 207);
  assert.equal(r.reservasExternas, 830);
  assert.equal(r.recorrenciaMensal, 89900);
  assert.equal(r.porPagamento.pix.reservas, 144);
  assert.equal(r.porPagamento.cartao.reservas, 63);
  assert.equal(r.taxaPrevista, 162000);
  assert.equal(r.gatewayPrevisto, 56691);
  assert.equal(
    r.liquidoPrevisto +
      r.recorrenciaMensal -
      Math.round((r.recorrenciaMensal * config.gatewayMRR) / 100),
    192512
  );
  assert.equal(r.liquidoPrevisto, r.porPagamento.pix.liquido + r.porPagamento.cartao.liquido);
  assert.equal(
    r.taxaPrevista,
    linhas.reduce((s, t) => s + valoresDaReserva(t, config).taxa, 0)
  );
  assert.equal(
    r.gatewayPrevisto,
    linhas.reduce((s, t) => s + valoresDaReserva(t, config).gateway, 0)
  );
});
test('mistura de pagamentos nos limites e app/cancelamentos sem receita', () => {
  const contas = contasDaProposta(contasIniciais().contas, h);
  for (const percentualPix of [0, 100]) {
    const linhas = reservasDaProposta(contas, '2026-10', { ...h, percentualPix });
    assert.ok(
      linhas
        .filter((t) => t.canal === 'app')
        .every((t) => t.pagamento === (percentualPix ? 'pix' : 'cartao'))
    );
  }
  for (const extra of [{ percentualApp: 0 }, { cancelamentos: 100 }]) {
    const r = resumoProposta(
      contas,
      reservasDaProposta(contas, '2026-10', { ...h, ...extra }),
      '2026-10-01',
      '2026-10-31',
      config
    );
    assert.equal(r.taxaPrevista, 0);
    assert.equal(r.gatewayPrevisto, 0);
  }
});
