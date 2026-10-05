const REGEX_HORARIO = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Valida o horário de funcionamento informado pelo gestor no cadastro.
 * @param {{abertura: string, fechamento: string}} horarioFuncionamento
 * @returns {string} Mensagem de erro, ou '' se estiver tudo certo.
 */
export function validarHorarioDeFuncionamento({ abertura, fechamento } = {}) {
  if (!REGEX_HORARIO.test(abertura || '') || !REGEX_HORARIO.test(fechamento || '')) {
    return 'Informe o horário de abertura e de fechamento.';
  }
  if (fechamento <= abertura) {
    return 'O horário de fechamento precisa ser depois da abertura.';
  }
  return '';
}
