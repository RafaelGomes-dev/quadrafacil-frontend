/** Aceita links antigos de um horário e links novos de múltiplos horários. */
export function normalizarHorarios(horarios) {
  const valores = Array.isArray(horarios) ? horarios : [horarios];
  return [...new Set(valores.filter((horario) => /^(?:[01]\d|2[0-3]):00$/.test(horario)))].sort();
}

export function intervaloDoHorario(horario) {
  return `${horario} às ${String(Number(horario.slice(0, 2)) + 1).padStart(2, '0')}:00`;
}

export function parametrosDaReserva(quadraId, data, horarios) {
  const parametros = new URLSearchParams({ quadraId, data });
  normalizarHorarios(horarios).forEach((horario) => parametros.append('horario', horario));
  return parametros.toString();
}
