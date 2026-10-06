/**
 * Grade de horários de uma quadra em uma data: livres (selecionáveis) e
 * ocupados (desabilitados).
 * @param {object} props
 * @param {string[]} props.horariosLivres
 * @param {string[]} props.horariosOcupados
 * @param {string[]} props.horariosSelecionados
 * @param {(horario: string) => void} props.onSelecionarHorario
 */
function SeletorHorario({
  horariosLivres,
  horariosOcupados,
  horariosSelecionados = [],
  onSelecionarHorario,
  precos = {},
  horarioBuscado = '',
}) {
  const todosOsHorarios = [...horariosLivres, ...horariosOcupados].sort();

  if (todosOsHorarios.length === 0) {
    return <p>Nenhum horário cadastrado para esta data.</p>;
  }

  return (
    <div className="grade-horarios">
      {todosOsHorarios.map((horario) => {
        const estaOcupado = horariosOcupados.includes(horario);
        const estaSelecionado = horariosSelecionados.includes(horario);

        return (
          <button
            key={horario}
            type="button"
            disabled={estaOcupado}
            aria-pressed={estaSelecionado}
            aria-label={horario}
            className={`horario-slot ${estaOcupado ? 'horario-ocupado' : 'horario-livre'} ${
              estaSelecionado ? 'horario-selecionado' : ''
            } ${horario === horarioBuscado && !estaSelecionado ? 'horario-buscado' : ''}`.trim()}
            onClick={() => onSelecionarHorario(horario)}
          >
            {horario}
            {precos[horario] && (
              <small>
                {precos[horario].promocao ? 'Promo · ' : ''}
                {precos[horario].texto}
              </small>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SeletorHorario;
