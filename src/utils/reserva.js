/** Mantém apenas os dígitos do telefone enviado para a API. */
export function normalizarTelefone(telefone) {
  return String(telefone || '').replace(/\D/g, '');
}

/** Retorna uma mensagem amigável quando os dados do cliente são inválidos. */
export function validarDadosDoCliente(nomeCliente, telefoneCliente) {
  if (String(nomeCliente).trim().length < 3) {
    return 'Informe o nome completo com pelo menos 3 caracteres.';
  }

  const telefoneNormalizado = normalizarTelefone(telefoneCliente);
  if (!/^\d{10,11}$/.test(telefoneNormalizado)) {
    return 'Informe um telefone com DDD e 10 ou 11 dígitos.';
  }

  return '';
}
