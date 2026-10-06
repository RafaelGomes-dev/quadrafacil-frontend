import { useState } from 'react';
import useRelogio from './useRelogio';
import { Link } from 'react-router-dom';
import Drawer from './Drawer';
import { useGestor } from './context';
import { conflito, eventosNoPeriodo, horaNumero, hoje, idNovo, valorDoEvento } from './model';
import { formatarData, formatarPreco } from '../utils/formatadores';
import { cancelarReserva } from '../services/reservaService';
import Icon from '../components/common/Icon';

export default function ReservaDrawer({ selecao, onClose, notify }) {
  const { dados, atualizar, externas, setExternas } = useGestor();
  const agora = useRelogio();
  const existente = Boolean(selecao.id);
  const [form, setForm] = useState({
    quadraId: dados.quadras[0]?.id,
    data: hoje(),
    inicio: '18:00',
    fim: '19:00',
    tipo: 'avulsa',
    cliente: '',
    telefone: '',
    origem: 'WhatsApp',
    metodo: 'dinheiro',
    pagamento: 'pendente',
    motivo: '',
    ...selecao,
  });
  const [erro, setErro] = useState('');
  const [cancelando, setCancelando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const quadra = dados.quadras.find((q) => String(q.id) === String(form.quadraId));
  const valor =
    form.tipo === 'bloqueio'
      ? 0
      : quadra
        ? valorDoEvento(dados, quadra, form.data, form.inicio, form.fim)
        : 0;
  const mudar = (chave, valor) => setForm((f) => ({ ...f, [chave]: valor }));
  function salvar(e) {
    e.preventDefault();
    setErro('');
    if (!quadra || horaNumero(form.fim) <= horaNumero(form.inicio))
      return setErro('O fim deve ser depois do início.');
    if (
      horaNumero(form.inicio) < horaNumero(quadra.horarioFuncionamento.abertura) ||
      horaNumero(form.fim) > horaNumero(quadra.horarioFuncionamento.fechamento)
    )
      return setErro('Escolha horários dentro do funcionamento da quadra.');
    if (
      form.tipo === 'avulsa' &&
      (!form.cliente.trim() || form.telefone.replace(/\D/g, '').length < 10)
    )
      return setErro('Preencha o nome e um telefone com DDD.');
    const evento = {
      ...form,
      id: idNovo(),
      cliente: form.tipo === 'bloqueio' ? form.motivo : form.cliente,
      status: 'confirmada',
      valor,
    };
    if (conflito([...eventosNoPeriodo(dados, form.data, form.data), ...externas], evento))
      return setErro(
        'Já existe uma reserva ou bloqueio neste intervalo. Escolha outro horário ou quadra.'
      );
    atualizar((d) => ({ ...d, eventos: [...d.eventos, evento] }));
    notify(form.tipo === 'bloqueio' ? 'Horário bloqueado.' : 'Reserva adicionada à agenda.');
    onClose();
  }
  async function cancelar() {
    if (!motivo.trim()) return setErro('Informe o motivo do cancelamento.');
    setProcessando(true);
    setErro('');
    try {
      if (form.apiId) {
        await cancelarReserva(form.apiId);
        setExternas((es) => es.map((e) => (e.id === form.id ? { ...e, status: 'cancelada' } : e)));
      } else if (form.mensalistaId && form.id.startsWith('mensal:')) {
        atualizar((d) => ({
          ...d,
          mensalistas: d.mensalistas.map((m) =>
            m.id === form.mensalistaId ? { ...m, excecoes: [...(m.excecoes || []), form.data] } : m
          ),
          eventos: [
            ...d.eventos,
            { ...form, id: idNovo(), status: 'cancelada', motivoCancelamento: motivo },
          ],
        }));
      } else
        atualizar((d) => ({
          ...d,
          eventos: d.eventos.map((e) =>
            e.id === form.id
              ? {
                  ...e,
                  status: 'cancelada',
                  motivoCancelamento: motivo,
                  reembolso: e.pagamento === 'pago' && e.tipo === 'avulsa' ? 'pendente' : null,
                }
              : e
          ),
        }));
      notify('Cancelamento registrado. O horário está livre.');
      onClose();
    } catch {
      setErro('Não foi possível cancelar agora. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  }
  const menos24 = new Date(`${form.data}T${form.inicio}:00`).getTime() - agora.getTime() < 86400000;
  return (
    <Drawer
      titulo={
        existente
          ? form.tipo === 'bloqueio'
            ? 'Detalhes do bloqueio'
            : 'Detalhes da reserva'
          : 'Organize o próximo horário'
      }
      subtitulo={
        existente
          ? `#${String(form.apiId || form.id)
              .slice(0, 8)
              .toUpperCase()}`
          : 'Reserva manual ou bloqueio de agenda.'
      }
      onClose={onClose}
    >
      {existente ? (
        <>
          <div className={`g-detail-hero g-event-${form.tipo}`}>
            <span>
              {form.tipo === 'mensalista'
                ? 'MENSALISTA'
                : form.tipo === 'bloqueio'
                  ? 'BLOQUEIO'
                  : 'RESERVA AVULSA'}
            </span>
            <h3>{form.cliente}</h3>
            <p>{quadra?.nome}</p>
          </div>
          <div className="g-detail-pair">
            <div>
              <small>Data</small>
              <strong>{formatarData(form.data)}</strong>
            </div>
            <div>
              <small>Horário</small>
              <strong>
                {form.inicio} às {form.fim}
              </strong>
            </div>
          </div>
          <dl className="g-detail-list">
            <div>
              <dt>Situação da reserva</dt>
              <dd>
                <span
                  className={`g-badge ${form.status === 'cancelada' ? 'g-badge-gray' : 'g-badge-green'}`}
                >
                  {form.status === 'cancelada' ? 'Cancelada' : 'Confirmada'}
                </span>
              </dd>
            </div>
            {form.tipo !== 'bloqueio' && (
              <>
                <div>
                  <dt>Telefone</dt>
                  <dd>{form.telefone || 'Não informado'}</dd>
                </div>
                <div>
                  <dt>Origem</dt>
                  <dd>{form.origem}</dd>
                </div>
                <div>
                  <dt>Forma de pagamento</dt>
                  <dd>
                    {{
                      pix: 'Pix',
                      cartao: 'Cartão',
                      dinheiro: 'Dinheiro',
                      online: 'Online',
                      mensalidade: 'Mensalidade',
                      local: 'A pagar no local',
                    }[form.metodo] || form.metodo}
                  </dd>
                </div>
                <div>
                  <dt>Pagamento</dt>
                  <dd>
                    <span
                      className={`g-badge ${form.pagamento === 'pago' ? 'g-badge-green' : 'g-badge-amber'}`}
                    >
                      {form.pagamento === 'pago' ? 'Recebido' : 'A receber'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>{form.tipo === 'mensalista' ? 'Valor mensal' : 'Valor da reserva'}</dt>
                  <dd>
                    <strong>
                      {formatarPreco(
                        form.tipo === 'mensalista'
                          ? (form.valorMensalReferencia ??
                              dados.mensalistas.find((m) => m.id === form.mensalistaId)
                                ?.valorMensal)
                          : form.valor || valor
                      )}
                    </strong>
                  </dd>
                </div>
              </>
            )}
            {form.motivo && (
              <div>
                <dt>Motivo</dt>
                <dd>{form.motivo}</dd>
              </div>
            )}
            {form.motivoCancelamento && (
              <div>
                <dt>Cancelamento</dt>
                <dd>{form.motivoCancelamento}</dd>
              </div>
            )}
            {form.reembolso && (
              <div>
                <dt>Reembolso</dt>
                <dd>Pendente · simulado</dd>
              </div>
            )}
          </dl>
          {form.mensalistaId && (
            <Link
              className="g-btn g-btn-light g-full"
              to="/gestor/configuracoes?aba=mensalistas"
              onClick={onClose}
            >
              Gerenciar recorrência <Icon name="seta" size={17} />
            </Link>
          )}
          {form.tipo !== 'bloqueio' &&
            form.pagamento !== 'pago' &&
            !form.apiId &&
            form.status !== 'cancelada' &&
            !form.mensalistaId && (
              <button
                className="g-btn g-btn-primary g-full"
                onClick={() => {
                  atualizar((d) => ({
                    ...d,
                    eventos: d.eventos.map((e) =>
                      e.id === form.id ? { ...e, pagamento: 'pago' } : e
                    ),
                  }));
                  notify('Recebimento registrado.');
                  onClose();
                }}
              >
                Marcar pagamento como recebido
              </button>
            )}
          {form.status !== 'cancelada' && (
            <div className="g-cancel-area">
              {!cancelando ? (
                <button className="g-btn g-btn-danger g-full" onClick={() => setCancelando(true)}>
                  {form.tipo === 'bloqueio'
                    ? 'Liberar horário'
                    : form.mensalistaId
                      ? 'Cancelar esta ocorrência'
                      : 'Cancelar reserva'}
                </button>
              ) : (
                <>
                  <h3>{menos24 ? 'Cancelamento excepcional' : 'Confirmar cancelamento'}</h3>
                  <p>
                    {menos24
                      ? 'Faltam menos de 24 horas. Registre o motivo da exceção.'
                      : 'O horário será liberado na agenda.'}
                    {form.pagamento === 'pago' && form.tipo !== 'mensalista'
                      ? ' O reembolso ficará pendente nesta simulação.'
                      : ''}
                  </p>
                  <label className="g-field">
                    Motivo
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Ex.: manutenção emergencial"
                      required
                    />
                  </label>
                  <button
                    className="g-btn g-btn-danger g-full"
                    disabled={processando}
                    onClick={cancelar}
                  >
                    {processando ? 'Cancelando…' : 'Confirmar cancelamento'}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <form className="g-form" onSubmit={salvar}>
          <div className="g-segmented g-wide">
            <button
              type="button"
              className={form.tipo === 'avulsa' ? 'ativo' : ''}
              onClick={() => mudar('tipo', 'avulsa')}
            >
              Adicionar reserva
            </button>
            <button
              type="button"
              className={form.tipo === 'bloqueio' ? 'ativo' : ''}
              onClick={() => mudar('tipo', 'bloqueio')}
            >
              Bloquear horário
            </button>
          </div>
          {dados.quadras.filter((q) => q.ativa !== false).length > 1 ? (
            <label className="g-field">
              Quadra
              <select value={form.quadraId} onChange={(e) => mudar('quadraId', e.target.value)}>
                {dados.quadras
                  .filter((q) => q.ativa !== false)
                  .map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.nome}
                    </option>
                  ))}
              </select>
            </label>
          ) : (
            <p className="g-info-banner">{quadra?.nome}</p>
          )}
          <label className="g-field">
            Data
            <input
              type="date"
              required
              min={hoje()}
              value={form.data}
              onInput={(e) => mudar('data', e.currentTarget.value)}
              onChange={(e) => mudar('data', e.target.value)}
            />
          </label>
          <div className="g-form-row">
            <label className="g-field">
              Início
              <input
                type="time"
                step="3600"
                required
                value={form.inicio}
                onChange={(e) => mudar('inicio', e.target.value)}
                onInput={(e) => mudar('inicio', e.currentTarget.value)}
              />
            </label>
            <label className="g-field">
              Fim
              <input
                type="time"
                step="3600"
                required
                value={form.fim}
                onChange={(e) => mudar('fim', e.target.value)}
                onInput={(e) => mudar('fim', e.currentTarget.value)}
              />
            </label>
          </div>
          {form.tipo === 'bloqueio' ? (
            <label className="g-field">
              Motivo do bloqueio
              <input
                required
                value={form.motivo}
                onChange={(e) => mudar('motivo', e.target.value)}
                placeholder="Ex.: manutenção, evento particular"
              />
            </label>
          ) : (
            <>
              <div className="g-form-divider">DADOS DO CLIENTE</div>
              <label className="g-field">
                Nome
                <input
                  required
                  value={form.cliente}
                  onChange={(e) => mudar('cliente', e.target.value)}
                  placeholder="Nome e sobrenome"
                />
              </label>
              <label className="g-field">
                Telefone com DDD
                <input
                  required
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => mudar('telefone', e.target.value)}
                  placeholder="(41) 99999-9999"
                />
              </label>
              <label className="g-field">
                Origem
                <select value={form.origem} onChange={(e) => mudar('origem', e.target.value)}>
                  <option>WhatsApp</option>
                  <option>Presencial</option>
                  <option>Telefone</option>
                </select>
              </label>
              <div className="g-form-row">
                <label className="g-field">
                  Pagamento
                  <select value={form.metodo} onChange={(e) => mudar('metodo', e.target.value)}>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">Pix</option>
                    <option value="cartao">Cartão</option>
                    <option value="local">A pagar no local</option>
                  </select>
                </label>
                <label className="g-field">
                  Situação
                  <select
                    value={form.pagamento}
                    onChange={(e) => mudar('pagamento', e.target.value)}
                  >
                    <option value="pendente">A receber</option>
                    <option value="pago">Recebido</option>
                  </select>
                </label>
              </div>
              <div className="g-form-total">
                <span>
                  {Math.max(0, horaNumero(form.fim) - horaNumero(form.inicio))} hora(s) de quadra
                </span>
                <strong>{formatarPreco(valor)}</strong>
              </div>
            </>
          )}
          <button className="g-btn g-btn-primary g-full" type="submit">
            <Icon name="check" />
            {form.tipo === 'bloqueio' ? 'Confirmar bloqueio' : 'Adicionar à agenda'}
          </button>
        </form>
      )}
      {erro && (
        <p role="alert" className="g-error">
          {erro}
        </p>
      )}
    </Drawer>
  );
}
