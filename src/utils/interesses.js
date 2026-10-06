export const CHAVE_INTERESSES = 'quadrafacil.interesses-demo.v1';

/** Apenas registros locais da demonstração; não envia notificações nem reserva vagas. */
export function registrarInteresse(registro, storage) {
  if (
    !['espera', 'mensalista'].includes(registro.tipo) ||
    !registro.quadraId ||
    !registro.contato?.trim()
  ) {
    throw new Error('Informe a quadra e seu contato.');
  }
  let registros;
  try {
    registros = JSON.parse(storage.getItem(CHAVE_INTERESSES) || '[]');
  } catch {
    registros = [];
  }
  if (!Array.isArray(registros)) registros = [];
  const contato = registro.contato.trim().toLowerCase();
  const chave = JSON.stringify([
    registro.tipo,
    String(registro.quadraId),
    registro.data,
    registro.horario,
    registro.diaSemana,
    contato,
  ]);
  if (registros.some((r) => r.chave === chave)) return { duplicado: true };
  storage.setItem(
    CHAVE_INTERESSES,
    JSON.stringify([
      ...registros,
      { ...registro, contato, chave, criadoEm: new Date().toISOString() },
    ])
  );
  return { duplicado: false };
}
