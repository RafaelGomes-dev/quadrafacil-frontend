import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

/** Resumo da reserva, escolha de pagamento e confirmação. */
function Reserva() {
  const { state, search } = useLocation();
  const parametros = new URLSearchParams(search);
  const quadraId = state?.quadraId || parametros.get('quadraId');
  const data = state?.data || parametros.get('data');
  const horario = state?.horario || parametros.get('horario');
  const [quadra, setQuadra] = useState(null);
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [metodoDePagamento, setMetodoDePagamento] = useState('pix');
  const [reservaCriada, setReservaCriada] = useState(null);
  const [pagamentoAprovado, setPagamentoAprovado] = useState(null);
  const [mensagemDeErro, setMensagemDeErro] = useState('');
  const [estaProcessando, setEstaProcessando] = useState(false);

  useEffect(() => {
    if (!quadraId) return;
    buscarQuadraPorId(quadraId)
      .then(setQuadra)
      .catch((erro) => {
        console.error('Falha ao carregar quadra da reserva:', erro);
        setMensagemDeErro('Não foi possível carregar os dados da quadra.');
      });
  }, [quadraId]);

  if (!quadraId || !data || !horario) {
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
      let reserva = reservaCriada;
      if (!reserva) {
        reserva = await criarReserva({
          quadraId,
          nomeCliente: nomeCliente.trim(),
          telefoneCliente: normalizarTelefone(telefoneCliente),
          data,
          horario,
        });
        setReservaCriada(reserva);
      }

      const pagamento = await processarPagamento({
        reservaId: reserva.id,
        metodo: metodoDePagamento,
      });
      setPagamentoAprovado(pagamento);
    } catch (erro) {
      console.error('Falha ao criar reserva:', erro);
      const mensagemDaApi = erro.response?.data?.error;
      setMensagemDeErro(
        erro.response?.status === 409
          ? 'Este horário acabou de ser reservado por outra pessoa. Escolha outro horário.'
          : mensagemDaApi || 'Não foi possível concluir a simulação. Tente novamente.'
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
              Sua reserva simulada para <strong>{quadra?.nome}</strong> foi confirmada.
            </p>
            <div className="reserva-confirmacao-dados">
              <span>
                <Icon name="calendario" size={19} /> {formatarData(data)}
              </span>
              <span>
                <Icon name="relogio" size={19} /> {horario}
              </span>
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
          to={`/user/quadras/${quadraId}?data=${data}&horario=${horario}`}
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
            <Button type="submit" disabled={estaProcessando || !quadra}>
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
                    <strong>{quadra.nome}</strong>
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
                      <small>Horário</small>
                      {horario} às {String(Number(horario.slice(0, 2)) + 1).padStart(2, '0')}:00
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
                <div className="reserva-resumo-total">
                  <span>Total da reserva</span>
                  <strong>{formatarPreco(quadra.precoHora)}</strong>
                </div>
                <small>1 hora de quadra · valor demonstrativo</small>
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
