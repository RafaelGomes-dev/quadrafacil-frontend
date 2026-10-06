import { horaNumero, somarDias } from './model.js';

export const DIAS_CURTOS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
export function precoSugerido(base, percentual) {
  return Math.round(Number(base) * (1 + Number(percentual) / 100) * 100) / 100;
}
// Histórico sintético separado da agenda, com padrões estáveis e denominador real de funcionamento.
export function mapaOcupacao(quadras, semanas = 4) {
  const horas = Array.from({ length: 15 }, (_, i) => i + 8);
  const celulas = horas.flatMap((hora) =>
    DIAS_CURTOS.map((dia, d) => {
      const capacidade =
        quadras.filter(
          (q) =>
            q.ativa !== false &&
            hora >= horaNumero(q.horarioFuncionamento.abertura) &&
            hora + 1 <= horaNumero(q.horarioFuncionamento.fechamento)
        ).length * semanas;
      const alvo =
        hora >= 18 && hora <= 21
          ? 75 + ((d * 7 + hora) % 20)
          : hora >= 14 && hora <= 16 && d < 4
            ? 12 + d * 4
            : 35 + ((d * 11 + hora * 3) % 35);
      const ocupadas = Math.round((capacidade * alvo) / 100);
      return {
        hora,
        dia,
        diaIndex: d,
        capacidade,
        ocupadas,
        percentual: capacidade ? Math.round((ocupadas / capacidade) * 100) : null,
      };
    })
  );
  const total = celulas.reduce((s, c) => s + c.capacidade, 0);
  const ocupadas = celulas.reduce((s, c) => s + c.ocupadas, 0);
  const validas = celulas.filter((c) => c.capacidade > 0);
  const rank = [...validas].sort((a, b) => b.percentual - a.percentual);
  const baixa = [...validas].sort((a, b) => a.percentual - b.percentual)[0];
  return {
    horas,
    celulas,
    capacidade: total,
    ocupadas,
    ocupacao: total ? Math.round((ocupadas / total) * 100) : 0,
    pico: rank[0],
    baixa,
    ranking: rank.slice(0, 3),
  };
}

export function lancamentosDemo(dados, referencia) {
  const quadras = dados.quadras.filter((q) => q.ativa !== false);
  if (!quadras.length) return [];
  const nomes = [
    'Lucas Almeida',
    'Mariana Costa',
    'Pedro Santos',
    'Camila Ferreira',
    'Bruno Oliveira',
    'Ana Martins',
  ];
  const inicioMes = `${referencia.slice(0, 7)}-01`;
  const dias = Number(referencia.slice(8));
  const avulsas = Array.from({ length: dias * 3 }, (_, i) => {
    const q = quadras[i % quadras.length];
    const data = somarDias(inicioMes, Math.floor(i / 3));
    const online = i % 3 !== 0;
    return {
      id: `FIN-${String(i + 1).padStart(4, '0')}`,
      data,
      quadraId: q.id,
      quadra: q.nome,
      cliente: nomes[i % nomes.length],
      tipo: 'avulsa',
      origem: online ? 'QuadraFácil' : 'Presencial',
      metodo: online ? (i % 2 ? 'Pix' : 'Cartão') : 'Dinheiro',
      valor: Math.round(q.precoHora * (i % 4 === 0 ? 2 : 1) * 100),
      status: i === 4 ? 'cancelada' : i === 8 ? 'reembolsada' : i % 7 === 0 ? 'pendente' : 'paga',
      repasse: data <= somarDias(referencia, -2) ? 'repassado' : 'previsto',
    };
  });
  const mensalidades = dados.mensalistas
    .filter((m) => m.de <= referencia && m.ate >= inicioMes)
    .map((m, i) => ({
      id: `MENS-${m.id}`,
      data: inicioMes,
      quadraId: m.quadraId,
      quadra: quadras.find((q) => String(q.id) === String(m.quadraId))?.nome || 'Quadra',
      cliente: m.cliente,
      tipo: 'mensalidade',
      origem: 'Presencial',
      metodo: 'Pix direto',
      valor: Math.round(m.valorMensal * 100),
      status: i % 2 === 0 ? 'paga' : 'pendente',
      repasse: 'direto',
    }));
  return [...avulsas, ...mensalidades].sort((a, b) => b.data.localeCompare(a.data));
}
export function resumoFinanceiro(lancamentos) {
  const validos = lancamentos.filter((l) => ['paga', 'pendente'].includes(l.status));
  const soma = (lista, fn = (l) => l.valor) => lista.reduce((s, l) => s + fn(l), 0);
  const pagas = validos.filter((l) => l.status === 'paga');
  const pendentes = validos.filter((l) => l.status === 'pendente');
  const bruto = soma(validos);
  const repassePendente = pagas.filter(
    (l) => l.origem === 'QuadraFácil' && l.repasse === 'previsto'
  );
  const caixa = pagas.filter((l) => l.origem !== 'QuadraFácil' || l.repasse === 'repassado');
  return {
    bruto,
    recebido: soma(caixa),
    pagamentosConfirmados: soma(pagas),
    pendente: soma(pendentes),
    repassePendente: soma(repassePendente),
    mensalidades: soma(validos.filter((l) => l.tipo === 'mensalidade')),
    online: soma(validos.filter((l) => l.origem === 'QuadraFácil')),
    direto: soma(validos.filter((l) => l.origem !== 'QuadraFácil')),
    validos,
  };
}
export const reaisCentavos = (valor) =>
  (valor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
