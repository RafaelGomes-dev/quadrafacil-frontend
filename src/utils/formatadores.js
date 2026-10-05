const formatadorDeMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Formata um valor em reais: 180 vira "R$ 180,00".
 * @param {number} valor
 * @returns {string}
 */
export function formatarPreco(valor) {
  return formatadorDeMoeda.format(valor);
}

/**
 * Converte uma data AAAA-MM-DD (formato da API) para DD/MM/AAAA.
 * @param {string} data
 * @returns {string}
 */
export function formatarData(data) {
  const [ano, mes, dia] = String(data).split('-');
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : data;
}
