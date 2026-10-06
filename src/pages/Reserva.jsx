import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CampoTelefone from '../components/CampoTelefone';
import { buscarQuadraPorId } from '../services/quadraService';
import { criarReserva } from '../services/reservaService';
import { processarPagamento } from '../services/pagamentoService';
import { normalizarTelefone, validarDadosDoCliente } from '../utils/reserva';
import { formatarData, formatarPreco } from '../utils/formatadores';

/** Resumo da reserva, escolha de pagamento e confirmação. */
function Reserva() {
  const { state } = useLocation();
  const [quadra, setQuadra] = useState(null);
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [metodoDePagamento, setMetodoDePagamento] = useState('pix');
  const [reservaCriada, setReservaCriada] = useState(null);
  const [pagamentoAprovado, setPagamentoAprovado] = useState(null);
  const [mensagemDeErro, setMensagemDeErro] = useState('');
  const [estaProcessando, setEstaProcessando] = useState(false);

  useEffect(() => {
    if (!state?.quadraId) return;
    buscarQuadraPorId(state.quadraId)
      .then(setQuadra)
      .catch((erro) => {
        console.error('Falha ao carregar quadra da reserva:', erro);
        setMensagemDeErro('Não foi possível carregar os dados da quadra.');
      });
  }, [state]);

  if (!state?.quadraId || !state?.data || !state?.horario) {
    return (
      <div className="container">
        <p>Selecione uma quadra e um horário antes de reservar.</p>
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
      const reserva = await criarReserva({
        quadraId: state.quadraId,
        nomeCliente: nomeCliente.trim(),
        telefoneCliente: normalizarTelefone(telefoneCliente),
        data: state.data,
        horario: state.horario,
      });
      setReservaCriada(reserva);
    } catch (erro) {
      console.error('Falha ao criar reserva:', erro);
      const mensagemDaApi = erro.response?.data?.error;
      setMensagemDeErro(
        erro.response?.status === 409
          ? 'Este horário acabou de ser reservado por outra pessoa. Escolha outro horário.'
          : mensagemDaApi || 'Não foi possível criar a reserva. Tente novamente.'
      );
    } finally {
      setEstaProcessando(false);
    }
  }

  async function confirmarPagamento() {
    setMensagemDeErro('');
    setEstaProcessando(true);

    try {
      const pagamento = await processarPagamento({
        reservaId: reservaCriada.id,
        metodo: metodoDePagamento,
      });
      setPagamentoAprovado(pagamento);
    } catch (erro) {
      console.error('Falha ao processar pagamento:', erro);
      setMensagemDeErro(
        erro.response?.data?.error || 'Não foi possível processar o pagamento. Tente novamente.'
      );
    } finally {
      setEstaProcessando(false);
    }
  }

  if (pagamentoAprovado) {
    return (
      <div className="container cartao-confirmacao">
        <h1>Reserva confirmada!</h1>
        <p>
          {quadra?.nome} em {formatarData(state.data)} às {state.horario}.
        </p>
        <p>Pagamento aprovado via {pagamentoAprovado.metodo === 'pix' ? 'Pix' : 'cartão'}.</p>
        <Link to="/user/quadras">Ver mais quadras</Link>
      </div>
    );
  }

  if (reservaCriada) {
    return (
      <div className="container pagina-reserva">
        <h1>Pagamento</h1>
        <p>
          Reserva #{reservaCriada.id} em {formatarData(state.data)} às {state.horario} —{' '}
          {quadra ? formatarPreco(quadra.precoHora) : ''}
        </p>

        <fieldset className="opcoes-pagamento">
          <label>
            <input
              type="radio"
              name="metodo"
              value="pix"
              checked={metodoDePagamento === 'pix'}
              onChange={() => setMetodoDePagamento('pix')}
            />
            Pix
          </label>
          <label>
            <input
              type="radio"
              name="metodo"
              value="cartao"
              checked={metodoDePagamento === 'cartao'}
              onChange={() => setMetodoDePagamento('cartao')}
            />
            Cartão
          </label>
        </fieldset>

        {mensagemDeErro && (
          <p className="mensagem-erro" role="alert" aria-live="polite">
            {mensagemDeErro}
          </p>
        )}

        <Button disabled={estaProcessando} onClick={confirmarPagamento}>
          {estaProcessando ? 'Processando...' : 'Pagar agora'}
        </Button>
      </div>
    );
  }

  return (
    <div className="container pagina-reserva">
      <h1>Confirmar reserva</h1>
      {quadra ? (
        <p>
          {quadra.nome} em {formatarData(state.data)} às {state.horario} —{' '}
          {formatarPreco(quadra.precoHora)}
        </p>
      ) : (
        <LoadingSpinner mensagem="Carregando resumo..." />
      )}

      <form onSubmit={confirmarReserva} className="formulario-reserva">
        <label className="campo-formulario">
          Nome completo
          <input
            type="text"
            required
            minLength="3"
            autoComplete="name"
            value={nomeCliente}
            onChange={(evento) => setNomeCliente(evento.target.value)}
          />
        </label>

        <CampoTelefone value={telefoneCliente} onChange={setTelefoneCliente} />

        {mensagemDeErro && (
          <p className="mensagem-erro" role="alert" aria-live="polite">
            {mensagemDeErro}
          </p>
        )}

        <Button type="submit" disabled={estaProcessando}>
          {estaProcessando ? 'Enviando...' : 'Continuar para pagamento'}
        </Button>
      </form>
    </div>
  );
}

export default Reserva;
