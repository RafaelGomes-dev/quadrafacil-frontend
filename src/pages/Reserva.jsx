import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CampoTelefone from '../components/CampoTelefone';
import { buscarQuadraPorId } from '../services/quadraService';
import { criarReserva } from '../services/reservaService';
import { processarPagamento } from '../services/pagamentoService';
import { normalizarTelefone, validarDadosDoCliente } from '../utils/reserva';
import { formatarData, formatarPreco } from '../utils/formatadores';
import { fotoDaQuadra, rotuloDoEsporte } from '../utils/apresentacaoQuadras';
import { cotarHorario } from '../services/gestorDemo';
import {
  normalizarHorarios,
  intervaloDoHorario,
  chaveDoItem,
  itensDosParametros,
  parametrosDosItens,
  gruposDosItens,
} from '../utils/horariosReserva';

/** Resumo da reserva, escolha de pagamento e confirmação. */
function Reserva() {
  const { state, search } = useLocation();
  const navegar = useNavigate();
  const parametros = new URLSearchParams(search);
  const [itens, setItens] = useState(() =>
    state?.quadraId
      ? normalizarHorarios(state.horarios || state.horario).map((horario) => ({
          quadraId: String(state.quadraId),
          data: state.data,
          horario,
        }))
      : itensDosParametros(parametros)
  );
  const quadraId = itens[0]?.quadraId;
  const data = itens[0]?.data;
  const horariosSelecionados = itens.map((i) => i.horario);
  const [quadras, setQuadras] = useState({});
  const quadra = quadras[quadraId];
  const contexto = Object.fromEntries(
    [...parametros].filter(([k]) => !['item', 'quadraId', 'horario'].includes(k))
  );
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [metodoDePagamento, setMetodoDePagamento] = useState('pix');
  const progresso = useRef({});
  const [reservaIniciada, setReservaIniciada] = useState(false);
  const [pagamentoAprovado, setPagamentoAprovado] = useState(null);
  const [mensagemDeErro, setMensagemDeErro] = useState('');
  const [estaProcessando, setEstaProcessando] = useState(false);
  const totalDaReserva = quadra
    ? itens.reduce(
        (total, i) =>
          total +
          (quadras[i.quadraId] ? cotarHorario(quadras[i.quadraId], i.data, i.horario).valor : 0),
        0
      )
    : 0;

  function removerHorario(item) {
    const restantes = itens.filter((i) => chaveDoItem(i) !== chaveDoItem(item));
    setItens(restantes);
    navegar(`/user/reserva?${parametrosDosItens(restantes, contexto)}`, {
      replace: true,
      state: null,
    });
  }

  useEffect(() => {
    if (!quadraId) return;
    let ativo = true;
    Promise.all(
      [...new Set(itens.map((i) => i.quadraId))].map(async (id) => [
        id,
        await buscarQuadraPorId(id),
      ])
    )
      .then((qs) => {
        if (ativo) setQuadras(Object.fromEntries(qs));
      })
      .catch((erro) => {
        console.error('Falha ao carregar quadra da reserva:', erro);
        setMensagemDeErro('Não foi possível carregar os dados da quadra.');
      });
    return () => {
      ativo = false;
    };
  }, [quadraId, itens]);

  if (!quadraId || !data || !horariosSelecionados.length) {
    return (
      <div className="container reserva-sem-selecao">
        <h1>Escolha seu próximo jogo</h1>
        <p>Selecione uma quadra e um horário para continuar.</p>
        <Link to="/user/quadras">Ver quadras disponíveis</Link>
      </div>
    );
  }

  async function confirmarReserva(evento) {
    evento.preventDefault();
    setMensagemDeErro('');

    const erroDeValidacao = validarDadosDoCliente(nomeCliente, telefoneCliente);
    if (erroDeValidacao) {
      setMensagemDeErro(erroDeValidacao);
      return;
    }

    setEstaProcessando(true);

    try {
      if (
        itens.some(
          (i) =>
            !quadras[i.quadraId] ||
            (quadras[i.quadraId].estabelecimentoId || `quadra-${i.quadraId}`) !==
              (quadra.estabelecimentoId || `quadra-${quadraId}`)
        )
      )
        throw new Error('Escolha quadras do mesmo estabelecimento.');
      // A API atual trabalha com um horário por reserva. Mantemos o progresso
      // para uma repetição não criar nem pagar novamente itens já concluídos.
      for (const escolhido of itens) {
        const chave = chaveDoItem(escolhido);
        let item = progresso.current[chave];
        if (!item) {
          const reserva = await criarReserva({
            quadraId: escolhido.quadraId,
            nomeCliente: nomeCliente.trim(),
            telefoneCliente: normalizarTelefone(telefoneCliente),
            data: escolhido.data,
            horario: escolhido.horario,
          });
          item = { reserva };
          progresso.current[chave] = item;
          setReservaIniciada(true);
        }
        if (!item.pagamento) {
          item.pagamento = await processarPagamento({
            reservaId: item.reserva.id,
            metodo: metodoDePagamento,
          });
        }
      }
      setPagamentoAprovado({ metodo: metodoDePagamento });
    } catch (erro) {
      console.error('Falha ao criar reserva:', erro);
      const mensagemDaApi = erro.response?.data?.error;
      const concluidos = Object.values(progresso.current).filter((item) => item.pagamento).length;
      const detalhe =
        erro.response?.status === 409
          ? 'Um dos horários já foi reservado. Volte à quadra para revisar a seleção.'
          : mensagemDaApi || 'Não foi possível concluir a simulação. Tente novamente.';
      setMensagemDeErro(
        concluidos ? `${concluidos} horário(s) já confirmado(s). ${detalhe}` : detalhe
      );
    } finally {
      setEstaProcessando(false);
    }
  }

  if (pagamentoAprovado) {
    return (
      <div className="pagina-reserva pagina-reserva-confirmada">
        <div className="container">
          <div className="reserva-confirmacao-card">
            <span className="reserva-confirmacao-icone">
              <Icon name="check" size={34} />
            </span>
            <span className="sobretitulo">TUDO CERTO</span>
            <h1>Partida marcada!</h1>
            <p>
              Sua reserva simulada para{' '}
              <strong>{quadra?.estabelecimentoNome || quadra?.nome}</strong> foi confirmada.
            </p>
            <div className="reserva-confirmacao-dados">
              <span>
                <Icon name="calendario" size={19} /> {formatarData(data)}
              </span>
              {gruposDosItens(itens).map((grupo) => (
                <span key={`${grupo.quadraId}-${grupo.data}-${grupo.intervalo}`}>
                  <Icon name="relogio" size={19} /> {quadras[grupo.quadraId]?.nome} ·{' '}
                  {formatarData(grupo.data)} · {grupo.intervalo}
                </span>
              ))}
            </div>
            <p className="reserva-simulacao-aviso">
              Pagamento simulado via {pagamentoAprovado.metodo === 'pix' ? 'Pix' : 'cartão'}.
              Nenhuma cobrança real foi feita.
            </p>
            <Link className="reserva-voltar-quadras" to="/user/quadras">
              Explorar outras quadras <Icon name="seta" size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-reserva">
      <div className="container">
        <Link
          className="detalhe-voltar"
          to={`/user/quadras/${parametros.get('estabelecimento') || quadraId}?${parametrosDosItens(itens, contexto)}`}
        >
          <Icon name="voltar" size={18} /> Voltar à quadra
        </Link>
        <div className="reserva-cabecalho">
          <span className="sobretitulo">ÚLTIMA ETAPA</span>
          <h1>Confira e confirme seu jogo.</h1>
          <p>Revise as informações antes de concluir a reserva simulada.</p>
        </div>

        <div className="reserva-layout">
          <form onSubmit={confirmarReserva} className="reserva-formulario">
            <section className="reserva-secao">
              <span className="reserva-etapa">01</span>
              <div>
                <h2>Seus dados</h2>
                <p>Usaremos estes dados apenas nesta simulação de reserva.</p>
              </div>
              <div className="reserva-campos">
                <label className="campo-formulario">
                  Nome completo
                  <input
                    type="text"
                    required
                    minLength="3"
                    autoComplete="name"
                    placeholder="Seu nome e sobrenome"
                    value={nomeCliente}
                    onChange={(evento) => setNomeCliente(evento.target.value)}
                  />
                </label>
                <CampoTelefone value={telefoneCliente} onChange={setTelefoneCliente} />
              </div>
            </section>

            <section className="reserva-secao">
              <span className="reserva-etapa">02</span>
              <div>
                <h2>Como prefere pagar?</h2>
                <p>Escolha uma opção para demonstrar o fluxo de pagamento.</p>
              </div>
              <fieldset className="reserva-metodos">
                <legend className="visually-hidden">Método de pagamento</legend>
                <label className={metodoDePagamento === 'pix' ? 'selecionado' : ''}>
                  <input
                    type="radio"
                    name="metodo"
                    value="pix"
                    checked={metodoDePagamento === 'pix'}
                    onChange={() => setMetodoDePagamento('pix')}
                  />
                  <span className="reserva-metodo-simbolo">◇</span>
                  <span>
                    <strong>Pix</strong>
                    <small>Confirmação simulada</small>
                  </span>
                </label>
                <label className={metodoDePagamento === 'cartao' ? 'selecionado' : ''}>
                  <input
                    type="radio"
                    name="metodo"
                    value="cartao"
                    checked={metodoDePagamento === 'cartao'}
                    onChange={() => setMetodoDePagamento('cartao')}
                  />
                  <span className="reserva-metodo-simbolo">▭</span>
                  <span>
                    <strong>Cartão</strong>
                    <small>Sem inserir dados reais</small>
                  </span>
                </label>
              </fieldset>
            </section>

            <div className="reserva-seguranca">
              <Icon name="escudo" size={22} />
              <span>Este é um protótipo. Nenhuma cobrança real será realizada.</span>
            </div>
            {mensagemDeErro && (
              <p className="mensagem-erro" role="alert" aria-live="polite">
                {mensagemDeErro}
              </p>
            )}
            <Button
              type="submit"
              disabled={estaProcessando || itens.some((i) => !quadras[i.quadraId])}
            >
              {estaProcessando ? 'Confirmando...' : 'Confirmar reserva simulada'}
              {!estaProcessando && <Icon name="seta" size={19} />}
            </Button>
          </form>

          <aside className="reserva-resumo">
            <span className="sobretitulo">RESUMO DA RESERVA</span>
            {quadra ? (
              <>
                <div className="reserva-resumo-quadra">
                  <img src={fotoDaQuadra(quadra)} alt={`Quadra ${quadra.nome}`} />
                  <div>
                    <strong>{quadra.estabelecimentoNome || quadra.nome}</strong>
                    <span>
                      {rotuloDoEsporte(quadra.esporte)} · {quadra.bairro}
                    </span>
                  </div>
                </div>
                <div className="reserva-resumo-dados">
                  <div>
                    <Icon name="calendario" size={20} />
                    <span>
                      <small>Data</small>
                      {formatarData(data)}
                    </span>
                  </div>
                  <div>
                    <Icon name="relogio" size={20} />
                    <span>
                      <small>Horários selecionados</small>
                      {horariosSelecionados.length}{' '}
                      {horariosSelecionados.length === 1 ? 'hora' : 'horas'} de quadra
                    </span>
                  </div>
                  <div>
                    <Icon name="local" size={20} />
                    <span>
                      <small>Local</small>
                      {quadra.endereco}, {quadra.bairro}
                    </span>
                  </div>
                </div>
                <ul className="reserva-itens">
                  {itens.map((item) => (
                    <li key={chaveDoItem(item)}>
                      <span>
                        <strong>
                          {quadras[item.quadraId]?.nome} · {intervaloDoHorario(item.horario)}
                        </strong>
                        <small>
                          {formatarData(item.data)} · 1 hora ·{' '}
                          {formatarPreco(
                            quadras[item.quadraId]
                              ? cotarHorario(quadras[item.quadraId], item.data, item.horario).valor
                              : 0
                          )}
                        </small>
                      </span>
                      <button
                        type="button"
                        aria-label={`Remover ${quadras[item.quadraId]?.nome} ${item.horario}`}
                        disabled={
                          estaProcessando || reservaIniciada || horariosSelecionados.length === 1
                        }
                        onClick={() => removerHorario(item)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="reserva-resumo-total">
                  <span>Total da reserva</span>
                  <strong>{formatarPreco(totalDaReserva)}</strong>
                </div>
                <small>
                  {horariosSelecionados.length}{' '}
                  {horariosSelecionados.length === 1 ? 'hora' : 'horas'} de quadra · valor
                  demonstrativo
                </small>
              </>
            ) : (
              <LoadingSpinner mensagem="Carregando resumo..." />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Reserva;
