import { gerarReservasCenario, HIPOTESES_CONSERVADORAS } from './cenario.js';
import { resumoNegocio } from './negocio.js';

export const PLANOS_PROPOSTA = {
  freemium: 'Free · gestão completa',
  premium: 'Crescimento · BI e automações',
};
export const CONFIG_PROPOSTA = {
  crescimento: 79900,
  patrocinio: 10000,
  taxaPix: 5,
  taxaCartao: 10,
  gatewayPix: 199,
  gatewayCartaoPercentual: 3,
  gatewayCartaoFixo: 49,
  gatewayMRR: 3,
};
export const CENARIO_PROPOSTA = {
  ...HIPOTESES_CONSERVADORAS,
  percentualPro: 0,
  percentualPremium: 10,
  percentualPix: 70,
};

// Os cadastros mantêm seus planos antigos; só esta projeção usa a nova proposta.
export function configurarProposta(config) {
  const anteriores = config.cenario || {};
  const operacao = Object.fromEntries(
    [
      'reservasDia',
      'diasAtivos',
      'ticket',
      'percentualApp',
      'cancelamentos',
      'percentualPatrocinio',
    ]
      .filter((k) => anteriores[k] !== undefined)
      .map((k) => [k, anteriores[k]])
  );
  return {
    ...CONFIG_PROPOSTA,
    ...config.proposta,
    cenario: { ...CENARIO_PROPOSTA, ...operacao, ...config.proposta?.cenario, percentualPro: 0 },
  };
}

export function contasDaProposta(contas, h, usarCadastros = false) {
  const elegiveis = contas.filter((c) => c.status === 'ativa' && Number(c.quadras) > 0);
  const pagas = Math.floor((elegiveis.length * h.percentualPremium) / 100);
  const patrocinados = Math.floor((elegiveis.length * h.percentualPatrocinio) / 100);
  return elegiveis.map((c, i) => ({
    ...c,
    plano: (usarCadastros ? ['pro', 'premium'].includes(c.plano) : i < pagas)
      ? 'premium'
      : 'freemium',
    patrocinado: usarCadastros ? Boolean(c.patrocinado) : i < patrocinados,
  }));
}

export function reservasDaProposta(contas, mes, h) {
  let app = 0;
  return gerarReservasCenario(contas, mes, h).map((t) => {
    if (t.canal !== 'app') return { ...t, pagamento: 'externo' };
    const pix =
      Math.floor(((app + 1) * h.percentualPix) / 100) > Math.floor((app * h.percentualPix) / 100);
    app++;
    return { ...t, pagamento: pix ? 'pix' : 'cartao' };
  });
}

export function valoresDaReserva(t, config) {
  if (t.canal !== 'app' || !['paga', 'pendente'].includes(t.status))
    return { taxa: 0, gateway: 0, liquido: 0, percentual: 0 };
  const percentual = t.pagamento === 'pix' ? config.taxaPix : config.taxaCartao;
  const taxa = Math.round((t.valor * percentual) / 100);
  const gateway =
    t.pagamento === 'pix'
      ? config.gatewayPix
      : Math.round(((t.valor + taxa) * config.gatewayCartaoPercentual) / 100) +
        config.gatewayCartaoFixo;
  return { taxa, gateway, liquido: taxa - gateway, percentual };
}

export function resumoProposta(contas, transacoes, inicio, fim, config) {
  const base = resumoNegocio(contas, transacoes, inicio, fim, {
    pro: 0,
    premium: config.crescimento,
    patrocinio: config.patrocinio,
    gatewayPercentual: 0,
  });
  const porPagamento = Object.fromEntries(
    ['pix', 'cartao'].map((meio) => {
      const validas = base.periodo.filter(
        (t) => t.canal === 'app' && t.pagamento === meio && ['paga', 'pendente'].includes(t.status)
      );
      const totais = validas.reduce(
        (s, t) => {
          const v = valoresDaReserva(t, config);
          return {
            taxa: s.taxa + v.taxa,
            gateway: s.gateway + v.gateway,
            liquido: s.liquido + v.liquido,
          };
        },
        { taxa: 0, gateway: 0, liquido: 0 }
      );
      return [meio, { ...totais, reservas: validas.length }];
    })
  );
  const taxaPaga = base.periodo
    .filter((t) => t.status === 'paga')
    .reduce((s, t) => s + valoresDaReserva(t, config).taxa, 0);
  const gatewayPago = base.periodo
    .filter((t) => t.status === 'paga')
    .reduce((s, t) => s + valoresDaReserva(t, config).gateway, 0);
  const taxaPrevista = porPagamento.pix.taxa + porPagamento.cartao.taxa;
  const gatewayPrevisto = porPagamento.pix.gateway + porPagamento.cartao.gateway;
  return {
    ...base,
    porPagamento,
    taxaPaga,
    taxaPendente: taxaPrevista - taxaPaga,
    taxaPrevista,
    gatewayPago,
    gatewayPrevisto,
    liquidoPago: taxaPaga - gatewayPago,
    liquidoPrevisto: taxaPrevista - gatewayPrevisto,
  };
}
