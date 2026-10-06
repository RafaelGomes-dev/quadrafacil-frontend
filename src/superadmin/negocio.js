export const PLANOS = { freemium: 'Freemium', pro: 'Pro', premium: 'Premium' };

// Base financeira independente da agenda: exemplos fictícios para apresentar o negócio.
export const TRANSACOES_DEMO = [
  {
    id: 'QF-1001',
    data: '2026-10-06',
    estabelecimento: 'Arena Batel',
    valor: 36000,
    status: 'paga',
  },
  {
    id: 'QF-1002',
    data: '2026-10-06',
    estabelecimento: 'Arena Cidade Industrial',
    valor: 15000,
    status: 'paga',
  },
  {
    id: 'QF-1003',
    data: '2026-10-06',
    estabelecimento: 'Arena Batel',
    valor: 12000,
    status: 'pendente',
  },
  {
    id: 'QF-1004',
    data: '2026-10-05',
    estabelecimento: 'Arena Batel',
    valor: 18000,
    status: 'paga',
  },
  {
    id: 'QF-1005',
    data: '2026-10-04',
    estabelecimento: 'Campo do Bacacheri',
    valor: 24000,
    status: 'reembolsada',
  },
  {
    id: 'QF-1006',
    data: '2026-10-03',
    estabelecimento: 'Arena Cidade Industrial',
    valor: 30000,
    status: 'paga',
  },
  {
    id: 'QF-1007',
    data: '2026-10-02',
    estabelecimento: 'Arena Batel',
    valor: 18000,
    status: 'cancelada',
  },
  {
    id: 'QF-1008',
    data: '2026-10-01',
    estabelecimento: 'Arena Batel',
    valor: 48000,
    status: 'paga',
  },
];
export function resumoNegocio(contas, transacoes, inicio, fim) {
  const ativas = contas.filter((c) => c.status === 'ativa');
  const planos = Object.fromEntries(
    Object.keys(PLANOS).map((plano) => [
      plano,
      ativas.filter((c) => (c.plano || 'freemium') === plano).length,
    ])
  );
  const periodo = transacoes.filter((t) => t.data >= inicio && t.data <= fim);
  const validas = periodo.filter((t) => ['paga', 'pendente'].includes(t.status));
  const pagas = validas.filter((t) => t.status === 'paga');
  const volume = validas.reduce((s, t) => s + t.valor, 0);
  const taxaPaga = pagas.reduce((s, t) => s + Math.round(t.valor * 0.1), 0);
  const taxaPendente = validas
    .filter((t) => t.status === 'pendente')
    .reduce((s, t) => s + Math.round(t.valor * 0.1), 0);
  return {
    planos,
    patrocinados: ativas.filter((c) => c.patrocinado).length,
    periodo,
    transacoes: validas.length,
    pagas: pagas.length,
    volume,
    taxaPaga,
    taxaPendente,
    taxaPrevista: taxaPaga + taxaPendente,
  };
}
