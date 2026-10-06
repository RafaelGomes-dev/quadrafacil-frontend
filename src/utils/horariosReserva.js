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

export function chaveDoItem(item) {
  return `${item.quadraId}|${item.data}|${item.horario}`;
}
export function itensDosParametros(parametros) {
  const itens = parametros
    .getAll('item')
    .map((valor) => {
      try {
        return JSON.parse(valor);
      } catch {
        return null;
      }
    })
    .filter(
      (item) =>
        item &&
        typeof item.quadraId === 'string' &&
        typeof item.horario === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.data) &&
        normalizarHorarios(item.horario).length
    );
  if (itens.length) return [...new Map(itens.map((item) => [chaveDoItem(item), item])).values()];
  if (!parametros.get('quadraId') || !parametros.get('data')) return [];
  return normalizarHorarios(parametros.getAll('horario')).map((horario) => ({
    quadraId: parametros.get('quadraId'),
    data: parametros.get('data'),
    horario,
  }));
}
export function parametrosDosItens(itens, filtros = {}) {
  const p = new URLSearchParams(Object.entries(filtros).filter(([k, v]) => k === 'esporte' || v));
  itens.forEach((item) => p.append('item', JSON.stringify(item)));
  return p.toString();
}
export function gruposDosItens(itens) {
  const grupos = new Map();
  itens.forEach((item) => {
    const chave = `${item.quadraId}|${item.data}`;
    if (!grupos.has(chave)) grupos.set(chave, { ...item, horarios: [] });
    grupos.get(chave).horarios.push(item.horario);
  });
  return [...grupos.values()].flatMap((g) =>
    intervalosDaReserva(g.horarios).map((intervalo) => ({ ...g, intervalo }))
  );
}
