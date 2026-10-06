/** Aceita links antigos de um horário e links novos de múltiplos horários. */
export function normalizarHorarios(horarios) {
  const valores = Array.isArray(horarios) ? horarios : [horarios];
  return [...new Set(valores.filter((horario) => /^(?:[01]\d|2[0-3]):00$/.test(horario)))].sort();
}

export function intervaloDoHorario(horario) {
  return `${horario} às ${String(Number(horario.slice(0, 2)) + 1).padStart(2, '0')}:00`;
}

/** Agrupa apenas horas consecutivas, mantendo as pausas entre reservas. */
export function intervalosDaReserva(horarios) {
  const grupos = [];
  for (const horario of normalizarHorarios(horarios)) {
    const hora = Number(horario.slice(0, 2));
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.fim === hora) ultimo.fim = hora + 1;
    else grupos.push({ inicio: hora, fim: hora + 1 });
  }
  return grupos.map(
    ({ inicio, fim }) =>
      `${String(inicio).padStart(2, '0')}:00 às ${String(fim).padStart(2, '0')}:00`
  );
}

export function parametrosDaReserva(quadraId, data, horarios) {
  const parametros = new URLSearchParams({ quadraId, data });
  normalizarHorarios(horarios).forEach((horario) => parametros.append('horario', horario));
  return parametros.toString();
}
