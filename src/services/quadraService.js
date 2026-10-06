import api from './api';
import { cotarBusca, gradeLocal, mesclarQuadras, quadraLocal } from './gestorDemo';
import { lerGestor } from '../gestor/model';

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
  if (!lerGestor()) {
    const resposta = await api.get('/quadras', { params: parametrosLimpos });
    return resposta.data;
  }
  const resposta = await api.get('/quadras');
  let quadras = mesclarQuadras(resposta.data)
    .map((q) => cotarBusca(q, filtros.data, filtros.horario))
    .filter(
      (q) =>
        (!filtros.cidade || q.cidade.toLowerCase().includes(filtros.cidade.toLowerCase())) &&
        (!filtros.bairro || q.bairro.toLowerCase().includes(filtros.bairro.toLowerCase())) &&
        (!filtros.esporte || q.esporte === filtros.esporte) &&
        (!filtros.precoMin || Number(q.precoBuscado ?? q.precoHora) >= Number(filtros.precoMin)) &&
        (!filtros.precoMax || Number(q.precoBuscado ?? q.precoHora) <= Number(filtros.precoMax))
    );
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
