import api from './api';
import { pagarLocal } from './gestorDemo';
import { pagarCatalogo } from './catalogoDemo';

/**
 * Processa o pagamento (simulado) de uma reserva e a confirma.
 * @param {object} dadosPagamento
 * @param {number|string} dadosPagamento.reservaId
 * @param {'pix'|'cartao'} dadosPagamento.metodo
 * @returns {Promise<object>} O pagamento criado.
 */
export async function processarPagamento(dadosPagamento) {
  if (String(dadosPagamento.reservaId).startsWith('catalogo-reserva-'))
    return pagarCatalogo(dadosPagamento.reservaId, dadosPagamento.metodo);
  const local = pagarLocal(dadosPagamento.reservaId, dadosPagamento.metodo);
  if (local) return local;
  const resposta = await api.post('/pagamentos', dadosPagamento);
  return resposta.data;
}
