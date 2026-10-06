import { useState } from 'react';
import useRelogio from './useRelogio';
import Icon from '../components/common/Icon';
import { diaSemana, horaNumero, horaTexto, hoje, inicioSemana, somarDias } from './model';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
function distribuir(eventos) {
  const mapa = {};
  let grupo = [];
  let fins = [];
  let fimGrupo = -1;
  function finalizar() {
    grupo.forEach(({ id, lane }) => {
      mapa[id] = { lane, total: fins.length };
    });
  }
  [...eventos]
    .sort((a, b) => horaNumero(a.inicio) - horaNumero(b.inicio))
    .forEach((e) => {
      const inicio = horaNumero(e.inicio),
        fim = horaNumero(e.fim);
      if (inicio >= fimGrupo) {
        finalizar();
        grupo = [];
        fins = [];
        fimGrupo = -1;
      }
      let lane = fins.findIndex((f) => f <= inicio);
      if (lane < 0) lane = fins.length;
      fins[lane] = fim;
      grupo.push({ id: e.id, lane });
      fimGrupo = Math.max(fimGrupo, fim);
    });
  finalizar();
  return mapa;
}
const dataLonga = (data) =>
  new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
export default function Agenda({
  quadras,
  eventos,
  data,
  setData,
  modo,
  setModo,
  selecionadas,
  setSelecionadas,
  onEvento,
  onNovo,
  compacta = false,
}) {
  const [filtroAberto, setFiltroAberto] = useState(false);
  const agora = useRelogio();
  const visiveis = quadras.filter((q) => q.ativa !== false && selecionadas.includes(String(q.id)));
  const dias =
    modo === 'semana'
      ? Array.from({ length: 7 }, (_, i) => somarDias(inicioSemana(data), i))
      : [data];
  const colunas =
    modo === 'dia'
      ? visiveis.map((q) => ({ data, quadra: q, titulo: q.nome }))
      : dias.map((d) => ({ data: d, titulo: DIAS[diaSemana(d)] }));
  const abertura = Math.min(...visiveis.map((q) => horaNumero(q.horarioFuncionamento.abertura)), 8);
  const fechamento = Math.max(
    ...visiveis.map((q) => horaNumero(q.horarioFuncionamento.fechamento)),
    22
  );
  const horas = Array.from({ length: Math.ceil(fechamento - abertura) }, (_, i) => abertura + i);
  const passo = 64;
  function mover(sentido) {
    setData(somarDias(data, sentido * (modo === 'semana' ? 7 : 1)));
  }
  return (
    <section className={`g-agenda g-card ${compacta ? 'g-agenda-compacta' : ''}`}>
      <div className="g-agenda-toolbar">
        <div className="g-agenda-titulo">
          <h2>{compacta ? 'Sua agenda' : 'Agenda dos espaços'}</h2>
          <span>O próximo jogo começa com uma agenda organizada.</span>
        </div>
        <div className="g-agenda-controles">
          <div className="g-segmented">
            <button className={modo === 'dia' ? 'ativo' : ''} onClick={() => setModo('dia')}>
              Dia
            </button>
            <button className={modo === 'semana' ? 'ativo' : ''} onClick={() => setModo('semana')}>
              Semana
            </button>
          </div>
          <div className="g-filtro-quadras">
            <button
              className="g-btn g-btn-light"
              aria-expanded={filtroAberto}
              onClick={() => setFiltroAberto(!filtroAberto)}
            >
              <Icon name="filtros" size={17} />
              {visiveis.length === quadras.filter((q) => q.ativa !== false).length
                ? 'Todas as quadras'
                : `${visiveis.length} quadra(s)`}
              <span>⌄</span>
            </button>
            {filtroAberto && (
              <div className="g-filtro-popover">
                <strong>Mostrar na agenda</strong>
                {quadras
                  .filter((q) => q.ativa !== false)
                  .map((q) => (
                    <label key={q.id}>
                      <input
                        type="checkbox"
                        checked={selecionadas.includes(String(q.id))}
                        onChange={(e) =>
                          setSelecionadas(
                            e.target.checked
                              ? [...selecionadas, String(q.id)]
                              : selecionadas.filter((id) => id !== String(q.id))
                          )
                        }
                      />
                      {q.nome}
                    </label>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="g-agenda-data">
        <div>
          <button className="g-btn g-btn-light" onClick={() => setData(hoje())}>
            Hoje
          </button>
          <button className="g-icon-btn" aria-label="Período anterior" onClick={() => mover(-1)}>
            ‹
          </button>
          <button className="g-icon-btn" aria-label="Próximo período" onClick={() => mover(1)}>
            ›
          </button>
          <strong>
            {modo === 'dia'
              ? dataLonga(data)
              : `${new Date(`${dias[0]}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} — ${dataLonga(dias[6])}`}
          </strong>
          <input
            aria-label="Ir para data"
            type="date"
            value={data}
            onChange={(e) => e.target.value && setData(e.target.value)}
            onInput={(e) => e.currentTarget.value && setData(e.currentTarget.value)}
          />
        </div>
        <div className="g-legenda">
          <span>
            <i className="avulsa" />
            Avulsa
          </span>
          <span>
            <i className="mensalista" />
            Mensalista
          </span>
          <span>
            <i className="bloqueio" />
            Bloqueio
          </span>
        </div>
      </div>
      {!visiveis.length ? (
        <div className="g-empty">Selecione uma quadra no filtro para visualizar a agenda.</div>
      ) : (
        <div className="g-calendar-scroll">
          <div
            className={`g-calendar g-calendar-${modo}`}
            style={{
              '--colunas': colunas.length,
              minWidth: modo === 'semana' ? 950 : Math.max(600, visiveis.length * 230),
            }}
          >
            <div className="g-calendar-head">
              <span className="g-timezone">GMT−3</span>
              {colunas.map((c, i) => (
                <div key={i} className={c.data === hoje() ? 'g-dia-hoje' : ''}>
                  {modo === 'semana' ? (
                    <>
                      <span>{c.titulo}</span>
                      <strong>{c.data.slice(-2)}</strong>
                    </>
                  ) : (
                    <>
                      <span className={`g-court-dot g-dot-${i % 3}`} />
                      <strong>{c.titulo}</strong>
                      <small>
                        {c.quadra.esporte === 'beach tennis'
                          ? 'Beach tennis'
                          : c.quadra.esporte === 'society'
                            ? 'Society'
                            : 'Futsal'}
                      </small>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="g-calendar-body">
              <div className="g-time-column">
                {horas.map((h) => (
                  <div key={h} style={{ height: passo }}>
                    {horaTexto(h)}
                  </div>
                ))}
              </div>
              {colunas.map((c, index) => {
                const quadrasColuna = c.quadra ? [c.quadra] : visiveis;
                const eventosColuna = eventos.filter(
                  (e) =>
                    e.status !== 'cancelada' &&
                    e.data === c.data &&
                    quadrasColuna.some((q) => String(q.id) === String(e.quadraId))
                );
                const distribuicao = distribuir(eventosColuna);
                return (
                  <div
                    className="g-calendar-column"
                    key={index}
                    style={{ height: horas.length * passo }}
                  >
                    {horas.map((h) => {
                      const aberta = quadrasColuna.some(
                        (q) =>
                          h >= horaNumero(q.horarioFuncionamento.abertura) &&
                          h + 1 <= horaNumero(q.horarioFuncionamento.fechamento)
                      );
                      return (
                        <button
                          className={`g-calendar-slot ${!aberta ? 'g-slot-fechado' : ''}`}
                          disabled={!aberta}
                          key={h}
                          style={{ height: passo }}
                          aria-label={`Adicionar reserva ${c.titulo}, ${c.data}, ${horaTexto(h)}`}
                          onClick={() =>
                            onNovo({
                              quadraId: c.quadra?.id || visiveis[0]?.id,
                              data: c.data,
                              inicio: horaTexto(h),
                              fim: horaTexto(h + 1),
                            })
                          }
                        >
                          <span>+ Reservar</span>
                        </button>
                      );
                    })}
                    {eventosColuna.map((e) => {
                      const indiceQuadra = quadrasColuna.findIndex(
                        (q) => String(q.id) === String(e.quadraId)
                      );
                      const q = quadrasColuna[indiceQuadra];
                      const lane = modo === 'semana' ? distribuicao[e.id].lane : 0;
                      const total = modo === 'semana' ? distribuicao[e.id].total : 1;
                      return (
                        <button
                          key={e.id}
                          className={`g-calendar-event g-event-${e.tipo}`}
                          style={{
                            top: (horaNumero(e.inicio) - abertura) * passo + 3,
                            height: Math.max(
                              36,
                              (horaNumero(e.fim) - horaNumero(e.inicio)) * passo - 6
                            ),
                            left: `calc(${(lane / total) * 100}% + 5px)`,
                            width: `calc(${100 / total}% - 10px)`,
                          }}
                          title={`${e.cliente} · ${q?.nome} · ${e.inicio} às ${e.fim}`}
                          onClick={() => onEvento(e)}
                        >
                          <span className="g-event-time">
                            {e.inicio}–{e.fim}
                          </span>
                          <strong>{e.cliente}</strong>
                          {modo === 'dia' && (
                            <small>
                              {e.tipo === 'bloqueio'
                                ? 'Indisponível'
                                : e.pagamento === 'pago'
                                  ? 'Pago'
                                  : e.tipo === 'mensalista'
                                    ? 'Recorrente'
                                    : 'A receber'}
                            </small>
                          )}
                          {modo === 'semana' && (
                            <small>
                              {q?.esporte === 'beach tennis'
                                ? 'Beach'
                                : q?.esporte === 'society'
                                  ? 'Society'
                                  : q?.esporte === 'futsal'
                                    ? 'Futsal'
                                    : q?.nome}
                            </small>
                          )}
                        </button>
                      );
                    })}
                    {c.data === hoje() && (
                      <div
                        className="g-agora"
                        style={{
                          top: (agora.getHours() + agora.getMinutes() / 60 - abertura) * passo,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="g-agenda-bottom">
        <Icon name="calendario" size={15} />
        <span>
          Clique em um horário livre para reservar ou em uma reserva para ver os detalhes.
        </span>
      </div>
    </section>
  );
}
