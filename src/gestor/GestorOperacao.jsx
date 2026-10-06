import { useState } from 'react';
import useRelogio from './useRelogio';
import { Link } from 'react-router-dom';
import { useGestor } from './context';
import { eventosNoPeriodo, horaNumero, hoje, inicioSemana, somarDias } from './model';
import Agenda from './Agenda';
import ReservaDrawer from './ReservaDrawer';
import Icon from '../components/common/Icon';
import { formatarData, formatarPreco } from '../utils/formatadores';

export default function GestorOperacao({ pagina = 'dashboard' }) {
  const { dados, externas } = useGestor();
  const agora = useRelogio();
  const [data, setData] = useState(hoje());
  const [modo, setModo] = useState('dia');
  const [periodo, setPeriodo] = useState('dia');
  const [selecionadas, setSelecionadas] = useState(() =>
    dados.quadras.filter((q) => q.ativa !== false).map((q) => String(q.id))
  );
  const [selecao, setSelecao] = useState(null);
  const [toast, setToast] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroQuadra, setFiltroQuadra] = useState('todas');
  const de = pagina === 'reservas' ? somarDias(hoje(), -30) : inicioSemana(data);
  const ate = pagina === 'reservas' ? somarDias(hoje(), 90) : somarDias(inicioSemana(data), 6);
  const portfolio = externas.filter((e) =>
    dados.quadras.some((q) => String(q.id) === String(e.quadraId))
  );
  const eventos = [
    ...eventosNoPeriodo(dados, de, ate),
    ...portfolio.filter((e) => e.data >= de && e.data <= ate),
  ].map((e) => {
    const q = dados.quadras.find((q) => String(q.id) === String(e.quadraId));
    return {
      ...e,
      valor:
        e.apiId && e.valor === 0
          ? (q?.precoHora || 0) * (horaNumero(e.fim) - horaNumero(e.inicio))
          : e.valor,
    };
  });
  const metricasDe = periodo === 'dia' ? data : inicioSemana(data);
  const metricasAte = periodo === 'dia' ? data : somarDias(inicioSemana(data), 6);
  const ativos = eventos.filter(
    (e) =>
      e.data >= metricasDe &&
      e.data <= metricasAte &&
      e.status !== 'cancelada' &&
      selecionadas.includes(String(e.quadraId))
  );
  const reservas = ativos.filter((e) => e.tipo !== 'bloqueio');
  const horas = reservas.reduce((total, e) => total + horaNumero(e.fim) - horaNumero(e.inicio), 0);
  const bloqueadas = ativos
    .filter((e) => e.tipo === 'bloqueio')
    .reduce((t, e) => t + horaNumero(e.fim) - horaNumero(e.inicio), 0);
  const capacidade =
    dados.quadras
      .filter((q) => q.ativa !== false && selecionadas.includes(String(q.id)))
      .reduce(
        (t, q) =>
          t +
          horaNumero(q.horarioFuncionamento.fechamento) -
          horaNumero(q.horarioFuncionamento.abertura),
        0
      ) *
      (periodo === 'dia' ? 1 : 7) -
    bloqueadas;
  const avulsas = reservas.filter((e) => e.tipo === 'avulsa');
  const valor = avulsas.reduce((t, e) => t + Number(e.valor || 0), 0);
  const recebido = avulsas
    .filter((e) => e.pagamento === 'pago')
    .reduce((t, e) => t + Number(e.valor || 0), 0);
  const proximas = eventos
    .filter(
      (e) =>
        e.status !== 'cancelada' &&
        e.tipo !== 'bloqueio' &&
        `${e.data}T${e.inicio}` >=
          `${hoje()}T${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
    )
    .sort((a, b) => `${a.data}${a.inicio}`.localeCompare(`${b.data}${b.inicio}`))
    .slice(0, 3);
  const lista = eventos
    .filter(
      (e) =>
        e.tipo !== 'bloqueio' &&
        (filtroStatus === 'todas' ||
          (filtroStatus === 'pendente'
            ? e.pagamento !== 'pago' && e.status !== 'cancelada'
            : filtroStatus === 'pago'
              ? e.pagamento === 'pago' && e.status !== 'cancelada'
              : e.status === filtroStatus)) &&
        (filtroQuadra === 'todas' || String(e.quadraId) === filtroQuadra) &&
        `${e.cliente} ${e.telefone} ${dados.quadras.find((q) => String(q.id) === String(e.quadraId))?.nome}`
          .toLowerCase()
          .includes(busca.toLowerCase())
    )
    .sort((a, b) => `${b.data}${b.inicio}`.localeCompare(`${a.data}${a.inicio}`));
  const notify = (mensagem) => {
    setToast(mensagem);
    setTimeout(() => setToast(''), 4500);
  };
  return (
    <>
      <div className="g-page-heading">
        <div>
          <span className="g-eyebrow">
            {pagina === 'dashboard'
              ? 'SUA OPERAÇÃO, EM UM OLHAR'
              : pagina === 'agenda'
                ? 'CADA HORÁRIO CONTA'
                : 'DO AGENDAMENTO AO JOGO'}
          </span>
          <h1>
            {pagina === 'dashboard'
              ? 'Olá, gestor.'
              : pagina === 'agenda'
                ? 'Um espaço para cada partida.'
                : 'Todas as reservas.'}
          </h1>
          <p>
            {pagina === 'dashboard'
              ? 'Acompanhe seus espaços e deixe o dia pronto para acontecer.'
              : pagina === 'agenda'
                ? 'Veja o que está livre, reservado ou bloqueado.'
                : 'Encontre seus clientes e acompanhe cada agendamento.'}
          </p>
        </div>
        <div className="g-heading-actions">
          <button
            className="g-btn g-btn-light"
            onClick={() => setSelecao({ tipo: 'bloqueio', data })}
          >
            <Icon name="escudo" size={17} />
            Bloquear horário
          </button>
          <button className="g-btn g-btn-primary" onClick={() => setSelecao({ data })}>
            <Icon name="mais" size={19} />
            Adicionar reserva
          </button>
        </div>
      </div>
      {pagina === 'dashboard' && (
        <>
          <div className="g-overview-period">
            <span>
              <Icon name="calendario" size={17} />
              {formatarData(data)} {periodo === 'semana' ? '· semana selecionada' : ''}
            </span>
            <div className="g-segmented">
              <button
                className={periodo === 'dia' ? 'ativo' : ''}
                onClick={() => setPeriodo('dia')}
              >
                Dia
              </button>
              <button
                className={periodo === 'semana' ? 'ativo' : ''}
                onClick={() => setPeriodo('semana')}
              >
                Semana
              </button>
            </div>
          </div>
          <div className="g-metrics">
            <div className="g-metric">
              <span>
                Reservas no período
                <Icon name="calendario" />
              </span>
              <strong>{reservas.length.toString().padStart(2, '0')}</strong>
              <small>
                {reservas.filter((e) => e.tipo === 'mensalista').length} de mensalistas ·{' '}
                {avulsas.length} avulsas
              </small>
            </div>
            <div className="g-metric">
              <span>
                Horas reservadas
                <Icon name="relogio" />
              </span>
              <strong>
                {horas}
                <em>h</em>
              </strong>
              <small>Tempo de quadra já garantido</small>
            </div>
            <div className="g-metric">
              <span>
                Ocupação das quadras
                <Icon name="quadra" />
              </span>
              <strong>
                {capacidade ? Math.min(100, Math.round((horas / capacidade) * 100)) : 0}
                <em>%</em>
              </strong>
              <div className="g-progress">
                <i
                  style={{
                    width: `${capacidade ? Math.min(100, (horas / capacidade) * 100) : 0}%`,
                  }}
                />
              </div>
              <small>Sobre as horas disponíveis</small>
            </div>
            <div className="g-metric g-metric-finance">
              <span>
                Valor previsto · avulsas
                <Icon name="dinheiro" />
              </span>
              <strong>{formatarPreco(valor)}</strong>
              <small>
                Recebido {formatarPreco(recebido)}
                <br />A receber {formatarPreco(valor - recebido)}
              </small>
            </div>
          </div>
          <div className="g-summary-strip">
            <span>
              <i />
              {dados.quadras.filter((q) => q.ativa !== false).length} quadras ativas
            </span>
            <span>
              <Icon name="pessoas" size={16} />
              {dados.mensalistas.filter((m) => m.ate >= hoje()).length} mensalistas
            </span>
            <small>
              Mensalidades acompanhadas separadamente, sem somar cada ocorrência à receita.
            </small>
          </div>
        </>
      )}
      {pagina === 'reservas' ? (
        <section className="g-card g-reservas-card">
          <div className="g-list-toolbar">
            <label className="g-search">
              <Icon name="busca" size={18} />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar cliente, telefone ou quadra"
                aria-label="Buscar reservas"
              />
            </label>
            <select
              aria-label="Filtrar quadra"
              value={filtroQuadra}
              onChange={(e) => setFiltroQuadra(e.target.value)}
            >
              <option value="todas">Todas as quadras</option>
              {dados.quadras.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.nome}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrar status"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todas">Todos os status</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendente">A receber</option>
              <option value="pago">Recebidas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th>Cliente / reserva</th>
                  <th>Quadra</th>
                  <th>Data e horário</th>
                  <th>Valor</th>
                  <th>Pagamento</th>
                  <th>Situação</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lista.map((e) => (
                  <tr key={e.id} onClick={() => setSelecao(e)}>
                    <td>
                      <strong>{e.cliente}</strong>
                      <small>{e.tipo === 'mensalista' ? 'Mensalista' : e.origem}</small>
                    </td>
                    <td>{dados.quadras.find((q) => String(q.id) === String(e.quadraId))?.nome}</td>
                    <td>
                      <strong>{formatarData(e.data)}</strong>
                      <small>
                        {e.inicio} às {e.fim}
                      </small>
                    </td>
                    <td>{e.tipo === 'mensalista' ? 'Mensalidade' : formatarPreco(e.valor)}</td>
                    <td>
                      <span
                        className={`g-badge ${e.pagamento === 'pago' ? 'g-badge-green' : 'g-badge-amber'}`}
                      >
                        {e.pagamento === 'pago' ? 'Recebido' : 'A receber'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`g-badge ${e.status === 'cancelada' ? 'g-badge-gray' : 'g-badge-green'}`}
                      >
                        {e.status === 'cancelada' ? 'Cancelada' : 'Confirmada'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="g-icon-btn"
                        aria-label={`Ver reserva de ${e.cliente} em ${e.data} às ${e.inicio}`}
                      >
                        <Icon name="seta" size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!lista.length && (
            <div className="g-empty">Nenhuma reserva encontrada com estes filtros.</div>
          )}
          <div className="g-table-footer">
            {lista.length} reservas · últimos 30 dias e próximos 90 dias
          </div>
        </section>
      ) : (
        <Agenda
          quadras={dados.quadras}
          eventos={eventos}
          data={data}
          setData={setData}
          modo={modo}
          setModo={setModo}
          selecionadas={selecionadas}
          setSelecionadas={setSelecionadas}
          onEvento={setSelecao}
          onNovo={setSelecao}
          compacta={pagina === 'dashboard'}
        />
      )}
      {pagina === 'dashboard' && (
        <section className="g-proximas">
          <div className="g-section-heading">
            <h2>Próximas partidas</h2>
            <Link to="/gestor/reservas">
              Ver todas as reservas <Icon name="seta" size={16} />
            </Link>
          </div>
          <div className="g-proximas-grid">
            {proximas.map((e) => (
              <button className="g-card g-proxima" key={e.id} onClick={() => setSelecao(e)}>
                <div className="g-proxima-hora">
                  <strong>{e.inicio}</strong>
                  <small>{e.data === hoje() ? 'Hoje' : formatarData(e.data)}</small>
                </div>
                <div>
                  <strong>{e.cliente}</strong>
                  <small>
                    {dados.quadras.find((q) => String(q.id) === String(e.quadraId))?.nome}
                  </small>
                </div>
                <Icon name="seta" size={17} />
              </button>
            ))}
          </div>
        </section>
      )}
      {selecao && (
        <ReservaDrawer
          key={selecao.id || 'nova'}
          selecao={selecao}
          onClose={() => setSelecao(null)}
          notify={notify}
        />
      )}
      {toast && (
        <div role="status" className="g-toast">
          <Icon name="check" />
          {toast}
        </div>
      )}
    </>
  );
}
