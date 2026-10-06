export const HIPOTESES_CONSERVADORAS = {
  reservasDia: 3,
  diasAtivos: 26,
  ticket: 120,
  percentualApp: 20,
  cancelamentos: 5,
  percentualPro: 20,
  percentualPremium: 5,
  percentualPatrocinio: 10,
};
/** Uma quadra por estabelecimento, sem multiplicar receita pelos complexos maiores. */
export function contasDoCenario(contas, h, usarPlanosAtuais = false) {
  const elegiveis = contas.filter((c) => c.status === 'ativa' && Number(c.quadras) > 0);
  if (usarPlanosAtuais) return elegiveis;
  const pro = Math.floor((elegiveis.length * h.percentualPro) / 100);
  const premium = Math.min(
    elegiveis.length - pro,
    Math.floor((elegiveis.length * h.percentualPremium) / 100)
  );
  const patrocinados = Math.floor((elegiveis.length * h.percentualPatrocinio) / 100);
  return elegiveis.map((c, i) => ({
    ...c,
    plano: i < pro ? 'pro' : i < pro + premium ? 'premium' : 'freemium',
    patrocinado: i < patrocinados,
  }));
}
/** Base determinística do mês inteiro; não é histórico real e não ocupa a agenda. */
export function gerarReservasCenario(contas, mes, h) {
  const [ano, numeroMes] = mes.split('-').map(Number);
  const diasNoMes = new Date(ano, numeroMes, 0).getDate();
  const diasAtivos = Math.min(diasNoMes, Math.max(1, Math.round(h.diasAtivos)));
  const quantidade = Math.max(0, Math.round(h.reservasDia * diasAtivos));
  const linhas = [];
  contas.forEach((c, indice) => {
    const dias = Array.from(
      { length: diasAtivos },
      (_, i) => 1 + Math.floor((i * diasNoMes) / diasAtivos)
    );
    const pesos = dias.map((d) =>
      [0, 6].includes(new Date(ano, numeroMes - 1, d).getDay()) ? 1.3 : 0.9
    );
    const totalPesos = pesos.reduce((s, p) => s + p, 0);
    let acumulado = 0;
    let distribuidas = 0;
    dias.forEach((dia, i) => {
      acumulado += pesos[i];
      const ateDia =
        i === dias.length - 1 ? quantidade : Math.round((quantidade * acumulado) / totalPesos);
      const quantidadeDia = ateDia - distribuidas;
      distribuidas = ateDia;
      for (let j = 0; j < quantidadeDia; j++) {
        const n = linhas.length;
        const peloApp =
          Math.floor(((n + 1) * h.percentualApp) / 100) > Math.floor((n * h.percentualApp) / 100);
        linhas.push({
          id: `SIM-${mes}-${c.id}-${dia}-${j}`,
          data: `${mes}-${String(dia).padStart(2, '0')}`,
          estabelecimento: c.estabelecimento,
          quadraId: `${c.id}-cenario-1`,
          horario: `${String([18, 19, 20, 21, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 22][(j + indice) % 15]).padStart(2, '0')}:00`,
          duracao: 1,
          valor: Math.round(h.ticket * 100),
          canal: peloApp ? 'app' : 'whatsapp',
          status: 'paga',
        });
      }
    });
  });
  for (const canal of ['app', 'whatsapp']) {
    linhas
      .filter((t) => t.canal === canal)
      .forEach((t, i) => {
        if (Math.ceil(((i + 1) * h.cancelamentos) / 100) > Math.ceil((i * h.cancelamentos) / 100))
          t.status = 'cancelada';
      });
  }
  return linhas.sort(
    (a, b) => a.data.localeCompare(b.data) || a.estabelecimento.localeCompare(b.estabelecimento)
  );
}
