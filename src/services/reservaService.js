import api from './api';

/**
 * Lista reservas, opcionalmente filtradas por quadra.
 * @param {object} [filtros]
 * @param {number|string} [filtros.quadraId]
 * @returns {Promise<object[]>} Lista de reservas.
 */
export async function listarReservas(filtros = {}) {
  const resposta = await api.get('/reservas', { params: filtros });
  return resposta.data;
}

/**
 * Cria uma nova reserva (nasce com status "pendente").
 * @param {object} dadosReserva
 * @param {number|string} dadosReserva.quadraId
 * @param {string} dadosReserva.nomeCliente
 * @param {string} dadosReserva.telefoneCliente
 * @param {string} dadosReserva.data
 * @param {string} dadosReserva.horario
 * @returns {Promise<object>} A reserva criada.
 */
export async function criarReserva(dadosReserva) {
  const resposta = await api.post('/reservas', dadosReserva);
  return resposta.data;
}

/**
 * Cancela uma reserva, liberando o horário.
 * @param {number|string} reservaId
 * @returns {Promise<object>} A reserva cancelada.
 */
export async function cancelarReserva(reservaId) {
  const resposta = await api.patch(`/reservas/${reservaId}/cancelar`);
  return resposta.data;
}
