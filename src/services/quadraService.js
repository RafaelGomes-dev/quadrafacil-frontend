import api from './api';
import { cotarBusca, gradeLocal, mesclarQuadras, quadraLocal } from './gestorDemo';
import { compativel } from '../utils/estabelecimentos';

/**
 * Busca quadras aplicando filtros de busca (todos opcionais).
 * @param {object} filtros
 * @param {string} [filtros.cidade]
 * @param {string} [filtros.bairro]
 * @param {string} [filtros.esporte]
 * @param {number|string} [filtros.precoMin]
 * @param {number|string} [filtros.precoMax]
 * @param {string} [filtros.data]
 * @param {string} [filtros.horario]
 * @returns {Promise<object[]>} Lista de quadras encontradas.
 */
export async function listarQuadras(filtros = {}) {
  const resposta = await api.get('/quadras');
  let quadras = mesclarQuadras(resposta.data)
    .map((q) => cotarBusca(q, filtros.data, filtros.horario))
    .filter((q) => compativel(q, filtros));
  if (filtros.data && filtros.horario) {
    const livres = await Promise.all(
      quadras.map(async (q) => ({ q, grade: await buscarHorariosDaQuadra(q.id, filtros.data) }))
    );
    quadras = livres
      .filter(({ grade }) => grade.horariosLivres.includes(filtros.horario))
      .map(({ q }) => q);
  }
  return quadras;
}

export async function buscarEstabelecimento(id) {
  const quadras = await listarQuadras();
  const referencia = quadras.find(
    (q) => String(q.id) === String(id) || (q.estabelecimentoId || `quadra-${q.id}`) === id
  );
  if (!referencia) throw new Error('Estabelecimento não encontrado');
  const grupo = referencia.estabelecimentoId || `quadra-${referencia.id}`;
  return {
    ...referencia,
    nome: referencia.estabelecimentoNome || referencia.nome,
    quadras: quadras.filter((q) => (q.estabelecimentoId || `quadra-${q.id}`) === grupo),
    id: grupo,
  };
}

/**
 * Busca o detalhe de uma quadra pelo id.
 * @param {number|string} quadraId
 * @returns {Promise<object>} A quadra encontrada.
 */
export async function buscarQuadraPorId(quadraId) {
  const local = quadraLocal(quadraId);
  if (local) return local;
  const resposta = await api.get(`/quadras/${quadraId}`);
  return resposta.data;
}

/**
 * Busca a grade de horários livres e ocupados de uma quadra em uma data.
 * @param {number|string} quadraId
 * @param {string} data - Data no formato AAAA-MM-DD.
 * @returns {Promise<{horariosLivres: string[], horariosOcupados: string[]}>}
 */
export async function buscarHorariosDaQuadra(quadraId, data) {
  const local = quadraLocal(quadraId);
  if (local) {
    const ocupados = String(quadraId).startsWith('local-')
      ? []
      : (await api.get(`/quadras/${quadraId}/horarios`, { params: { data } })).data
          .horariosOcupados;
    return gradeLocal(local, data, ocupados);
  }
  const resposta = await api.get(`/quadras/${quadraId}/horarios`, { params: { data } });
  return resposta.data;
}

/**
 * Cadastra uma nova quadra (fluxo do gestor/proprietário).
 * @param {object} dadosQuadra
 * @returns {Promise<object>} A quadra criada.
 */
export async function cadastrarQuadra(dadosQuadra) {
  const resposta = await api.post('/quadras', dadosQuadra);
  return resposta.data;
}
