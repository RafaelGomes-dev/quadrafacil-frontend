import { lerAdmin } from '../superadmin/model.js';
const CHAVE = 'quadrafacil-catalogo-reservas-v1';
const BAIRROS = [
  'Água Verde',
  'Portão',
  'Cabral',
  'Santa Felicidade',
  'Boa Vista',
  'Hauer',
  'Jardim Social',
  'Rebouças',
  'Mercês',
  'Pinheirinho',
  'Uberaba',
  'Prado Velho',
];

/** Espaços fictícios publicados pelos gestores de exemplo, separados da Arena Batel. */
export function gerarQuadrasCatalogo(contas) {
  return contas
    .filter((c) => c.id.startsWith('demo-'))
    .flatMap((c, i) =>
      c.status !== 'ativa'
        ? []
        : Array.from({ length: Number(c.quadras) || 0 }, (_, n) => ({
            id: `catalogo-${c.id}-${n + 1}`,
            estabelecimentoId: `catalogo-${c.id}`,
            estabelecimentoNome: c.estabelecimento,
            nome: `Quadra ${n + 1}`,
            esporte: 'society',
            bairro: BAIRROS[i % BAIRROS.length],
            cidade: 'Curitiba',
            endereco: `Endereço fictício · ${BAIRROS[i % BAIRROS.length]}, Curitiba`,
            precoHora: 100 + ((i + n) % 7) * 15,
            piso: 'Grama sintética',
            patrocinado: Boolean(c.patrocinado),
            descricao:
              'Espaço fictício de demonstração, com quadras de society para reunir seu time. Fotos, preços e disponibilidade ilustrativos.',
            fotos: [],
            ativa: true,
            estrutura: {
              coberta: (i + n) % 2 === 0,
              vestiario: true,
              estacionamento: i % 3 !== 0,
              iluminacao: true,
            },
            horarioFuncionamento: { abertura: '08:00', fechamento: '23:00' },
          }))
    );
}
export const quadrasCatalogo = () => gerarQuadrasCatalogo(lerAdmin().contas);
export const quadraCatalogo = (id) => quadrasCatalogo().find((q) => q.id === String(id));
function reservas(storage) {
  try {
    const itens = JSON.parse(storage.getItem(CHAVE) || '[]');
    return Array.isArray(itens) ? itens : [];
  } catch {
    return [];
  }
}
export function gradeCatalogo(id, data, storage = window.localStorage) {
  const todos = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
  const ocupados = new Set([
    '12:00',
    '18:00',
    ...reservas(storage)
      .filter((r) => r.quadraId === String(id) && r.data === data)
      .map((r) => r.horario),
  ]);
  return {
    horariosLivres: todos.filter((h) => !ocupados.has(h)),
    horariosOcupados: todos.filter((h) => ocupados.has(h)),
  };
}
export function reservarCatalogo(dados, quadra, storage = window.localStorage) {
  if (!gradeCatalogo(quadra.id, dados.data, storage).horariosLivres.includes(dados.horario))
    throw new Error('Este horário não está disponível.');
  const reserva = {
    ...dados,
    quadraId: String(quadra.id),
    id: `catalogo-reserva-${crypto.randomUUID()}`,
    status: 'pendente',
    valorTotal: quadra.precoHora,
  };
  storage.setItem(CHAVE, JSON.stringify([...reservas(storage), reserva]));
  return reserva;
}
export function pagarCatalogo(id, metodo, storage = window.localStorage) {
  const lista = reservas(storage);
  const reserva = lista.find((r) => r.id === id);
  if (!reserva) throw new Error('Reserva demonstrativa não encontrada.');
  storage.setItem(
    CHAVE,
    JSON.stringify(lista.map((r) => (r.id === id ? { ...r, status: 'confirmada', metodo } : r)))
  );
  return {
    id: `pagamento-${id}`,
    reservaId: id,
    metodo,
    valor: reserva.valorTotal,
    status: 'aprovado',
  };
}
