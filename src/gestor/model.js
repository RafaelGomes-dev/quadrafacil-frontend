import { formatarDataLocalISO } from '../utils/data.js';

export const STORAGE_KEY = 'quadrafacil-gestor-v1';
export const hoje = () => formatarDataLocalISO();
export function somarDias(data, quantidade) {
  const valor = new Date(`${data}T12:00:00`);
  valor.setDate(valor.getDate() + quantidade);
  return formatarDataLocalISO(valor);
}
export const diaSemana = (data) => new Date(`${data}T12:00:00`).getDay();
export const inicioSemana = (data) => somarDias(data, -(diaSemana(data) + 6) % 7);
export const horaNumero = (hora) => Number(hora.split(':')[0]) + Number(hora.split(':')[1]) / 60;
export const horaTexto = (hora) =>
  `${String(Math.floor(hora)).padStart(2, '0')}:${hora % 1 ? '30' : '00'}`;
export const idNovo = () => crypto.randomUUID();

const court = (
  id,
  nome,
  esporte,
  bairro,
  endereco,
  precoHora,
  coberta,
  abertura = '08:00',
  fechamento = '23:00'
) => ({
  id,
  nome,
  esporte,
  bairro,
  endereco,
  cidade: 'Curitiba',
  precoHora,
  descricao: 'Um espaço bem cuidado para reunir seu time e jogar com tranquilidade.',
  fotos: [],
  estrutura: { coberta, vestiario: true, estacionamento: true, iluminacao: true },
  horarioFuncionamento: { abertura, fechamento },
  ativa: true,
});
export function dadosIniciais() {
  const data = hoje();
  const quadras = [
    court(1, 'Quadra 1', 'society', 'Batel', 'Rua Comendador Araújo, 540', 180, false),
    court(
      2,
      'Quadra 2',
      'society',
      'Batel',
      'Rua Comendador Araújo, 540',
      120,
      true,
      '09:00',
      '22:00'
    ),
    court(4, 'Quadra 3', 'beach tennis', 'Batel', 'Rua Comendador Araújo, 540', 90, false),
  ];
  const nomes = [
    'Lucas Almeida',
    'Mariana Costa',
    'Pedro Santos',
    'Camila Ferreira',
    'Bruno Oliveira',
    'Ana Martins',
    'Gabriel Lima',
  ];
  const eventos = [];
  for (let d = -3; d < 11; d++) {
    const dia = somarDias(data, d);
    quadras.forEach((q, i) => {
      [10 + i, 16 + i, 20].forEach((inicio, j) => {
        if ((d + i + j + 30) % 4 === 0) return;
        eventos.push({
          id: `demo-${d}-${i}-${j}`,
          quadraId: q.id,
          data: dia,
          inicio: horaTexto(inicio),
          fim: horaTexto(inicio + (j === 1 ? 2 : 1)),
          tipo: 'avulsa',
          cliente: nomes[(d + i + j + 30) % nomes.length],
          telefone: '(41) 99999-0000',
          origem: j === 0 ? 'WhatsApp' : 'QuadraFácil',
          metodo: j === 0 ? 'dinheiro' : 'pix',
          pagamento: j === 0 ? 'pendente' : 'pago',
          status: 'confirmada',
          valor: q.precoHora * (j === 1 ? 2 : 1),
        });
      });
    });
  }
  eventos.push({
    id: 'demo-bloqueio',
    quadraId: 4,
    data,
    inicio: '13:00',
    fim: '15:00',
    tipo: 'bloqueio',
    cliente: 'Manutenção da areia',
    motivo: 'Nivelamento e limpeza da quadra',
    status: 'confirmada',
    valor: 0,
  });
  return {
    estabelecimento: {
      id: 'arena-batel',
      nome: 'Arena Batel',
      contato: '(41) 3333-0000',
      cidade: 'Curitiba',
      bairro: 'Batel',
      endereco: 'Rua Comendador Araújo, 540',
    },
    quadras,
    eventos,
    regras: [],
    mensalistas: [
      {
        id: 'mensal-demo',
        quadraId: 1,
        cliente: 'Turma do Rafael',
        telefone: '(41) 99999-0000',
        dia: diaSemana(data),
        inicio: '12:00',
        fim: '14:00',
        de: somarDias(data, -28),
        ate: somarDias(data, 90),
        valorMensal: 1200,
        pagamento: 'pago',
        excecoes: [],
      },
    ],
  };
}

export function lerGestor() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!dados) return null;
    if (!dados.estabelecimento.id) {
      const base = dados.quadras.find((q) => Number(q.id) === 1) || dados.quadras[0];
      dados.estabelecimento = {
        ...dados.estabelecimento,
        id: 'arena-batel',
        bairro: base?.bairro,
        endereco: base?.endereco,
        nome:
          dados.estabelecimento.nome === 'Espaços Curitiba'
            ? 'Arena Batel'
            : dados.estabelecimento.nome,
      };
      const antigos = ['Arena Batel Society', 'Quadra Boa Vista Futsal', 'Beach Sports Água Verde'];
      dados.quadras = dados.quadras.map((q) =>
        antigos.includes(q.nome)
          ? {
              ...q,
              nome: `Quadra ${q.id === 4 ? 3 : q.id}`,
              esporte: q.id === 2 ? 'society' : q.esporte,
              bairro: base?.bairro,
              endereco: base?.endereco,
            }
          : q
      );
    }
    return dados;
  } catch {
    return null;
  }
}
export function salvarGestor(dados) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  window.dispatchEvent(new Event('quadrafacil-gestor'));
}

export function eventosNoPeriodo(dados, de, ate) {
  const eventos = dados.eventos.filter((e) => e.data >= de && e.data <= ate);
  for (let data = de; data <= ate; data = somarDias(data, 1)) {
    dados.mensalistas.forEach((m) => {
      if (
        data < m.de ||
        data > m.ate ||
        diaSemana(data) !== Number(m.dia) ||
        m.excecoes?.includes(data)
      )
        return;
      const q = dados.quadras.find((q) => String(q.id) === String(m.quadraId));
      eventos.push({
        id: `mensal:${m.id}:${data}`,
        mensalistaId: m.id,
        quadraId: m.quadraId,
        data,
        inicio: m.inicio,
        fim: m.fim,
        tipo: 'mensalista',
        cliente: m.cliente,
        telefone: m.telefone,
        origem: 'Mensalista',
        metodo: 'mensalidade',
        pagamento: m.pagamento,
        status: 'confirmada',
        valor: 0,
        valorReferencia: (q?.precoHora || 0) * (horaNumero(m.fim) - horaNumero(m.inicio)),
      });
    });
  }
  return eventos.sort((a, b) => `${a.data}${a.inicio}`.localeCompare(`${b.data}${b.inicio}`));
}

export function conflito(eventos, item, ignorarId) {
  return eventos.find(
    (e) =>
      e.id !== ignorarId &&
      e.status !== 'cancelada' &&
      String(e.quadraId) === String(item.quadraId) &&
      e.data === item.data &&
      horaNumero(e.inicio) < horaNumero(item.fim) &&
      horaNumero(e.fim) > horaNumero(item.inicio)
  );
}
export function precoNoHorario(dados, quadra, data, horario) {
  if (!dados || !data || !horario) return { valor: Number(quadra.precoHora), promocao: false };
  const regras = dados.regras.filter(
    (r) =>
      String(r.quadraId) === String(quadra.id) &&
      horaNumero(horario) >= horaNumero(r.inicio) &&
      horaNumero(horario) < horaNumero(r.fim) &&
      (r.tipo === 'data' ? r.data === data : Number(r.dia) === diaSemana(data))
  );
  const regra = regras.filter((r) => r.tipo === 'data').at(-1) || regras.at(-1);
  return {
    valor: Number(regra?.valor ?? quadra.precoHora),
    promocao: Boolean(regra?.promocao),
    rotulo: regra?.nome,
  };
}

export function valorDoEvento(dados, quadra, data, inicio, fim) {
  let valor = 0;
  for (let h = horaNumero(inicio); h < horaNumero(fim); h++)
    valor += precoNoHorario(dados, quadra, data, horaTexto(h)).valor;
  return valor;
}
