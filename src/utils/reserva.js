/** Mantém apenas os dígitos do telefone enviado para a API. */
export function normalizarTelefone(telefone) {
  return String(telefone || '').replace(/\D/g, '');
}

/**
 * Aplica a máscara de telefone enquanto a pessoa digita:
 * "41999990000" vira "(41) 99999-0000" e "4133330000" vira "(41) 3333-0000".
 */
export function formatarTelefone(telefone) {
  const digitos = normalizarTelefone(telefone).slice(0, 11);
  if (digitos.length <= 2) return digitos ? `(${digitos}` : '';

  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  const tamanhoDoPrefixo = numero.length > 8 ? 5 : 4;
  if (numero.length <= tamanhoDoPrefixo) return `(${ddd}) ${numero}`;

  return `(${ddd}) ${numero.slice(0, tamanhoDoPrefixo)}-${numero.slice(tamanhoDoPrefixo)}`;
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
