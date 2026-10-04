import api from './api';

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
  const parametrosLimpos = Object.fromEntries(
    Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== '')
  );
  const resposta = await api.get('/quadras', { params: parametrosLimpos });
  return resposta.data;
}

/**
 * Busca o detalhe de uma quadra pelo id.
 * @param {number|string} quadraId
 * @returns {Promise<object>} A quadra encontrada.
 */
export async function buscarQuadraPorId(quadraId) {
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
