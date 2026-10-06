/**
 * Grade de horários de uma quadra em uma data: livres (selecionáveis) e
 * ocupados (desabilitados).
 * @param {object} props
 * @param {string[]} props.horariosLivres
 * @param {string[]} props.horariosOcupados
 * @param {string} props.horarioSelecionado
 * @param {(horario: string) => void} props.onSelecionarHorario
 */
function SeletorHorario({
  horariosLivres,
  horariosOcupados,
  horarioSelecionado,
  onSelecionarHorario,
}) {
  const todosOsHorarios = [...horariosLivres, ...horariosOcupados].sort();

  if (todosOsHorarios.length === 0) {
    return <p>Nenhum horário cadastrado para esta data.</p>;
  }

  return (
    <div className="grade-horarios">
      {todosOsHorarios.map((horario) => {
        const estaOcupado = horariosOcupados.includes(horario);
        const estaSelecionado = horario === horarioSelecionado;

        return (
          <button
            key={horario}
            type="button"
            disabled={estaOcupado}
            aria-pressed={estaSelecionado}
            className={`horario-slot ${estaOcupado ? 'horario-ocupado' : 'horario-livre'} ${
              estaSelecionado ? 'horario-selecionado' : ''
            }`.trim()}
            onClick={() => onSelecionarHorario(horario)}
          >
            {horario}
          </button>
        );
      })}
    </div>
  );
}

export default SeletorHorario;
