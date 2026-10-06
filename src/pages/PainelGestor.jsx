import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { listarQuadras } from '../services/quadraService';
import { cancelarReserva, listarReservas } from '../services/reservaService';
import { formatarData } from '../utils/formatadores';

const ROTULOS_DE_STATUS = {
  pendente: 'Pendente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
};

/** Painel do gestor: reservas, status de pagamento e cancelamento. */
function PainelGestor() {
  const { state } = useLocation();
  const [reservas, setReservas] = useState([]);
  const [quadrasPorId, setQuadrasPorId] = useState({});
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [mensagemDeErro, setMensagemDeErro] = useState('');

  const carregarDados = useCallback(() => {
    setEstaCarregando(true);
    setMensagemDeErro('');

    Promise.all([listarReservas(), listarQuadras()])
      .then(([listaDeReservas, listaDeQuadras]) => {
        setReservas(listaDeReservas);
        setQuadrasPorId(Object.fromEntries(listaDeQuadras.map((quadra) => [quadra.id, quadra])));
      })
      .catch((erro) => {
        console.error('Falha ao carregar painel do gestor:', erro);
        setMensagemDeErro('Não foi possível carregar as reservas agora.');
      })
      .finally(() => setEstaCarregando(false));
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function cancelar(reservaId) {
    try {
      await cancelarReserva(reservaId);
      carregarDados();
    } catch (erro) {
      console.error('Falha ao cancelar reserva:', erro);
      setMensagemDeErro('Não foi possível cancelar esta reserva.');
    }
  }

  if (estaCarregando) return <LoadingSpinner mensagem="Carregando painel..." />;

  return (
    <div className="container pagina-painel-gestor">
      <h1>Painel do Gestor</h1>

      {state?.quadraCadastrada && (
        <p className="mensagem-sucesso">Quadra {state.quadraCadastrada} cadastrada com sucesso.</p>
      )}

      {mensagemDeErro && <p className="mensagem-erro">{mensagemDeErro}</p>}

      {reservas.length === 0 && !mensagemDeErro && <p>Nenhuma reserva registrada ainda.</p>}

      <table className="tabela-reservas">
        <thead>
          <tr>
            <th>Quadra</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Horário</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva.id}>
              <td>{quadrasPorId[reserva.quadraId]?.nome || `Quadra #${reserva.quadraId}`}</td>
              <td>{reserva.nomeCliente}</td>
              <td>{formatarData(reserva.data)}</td>
              <td>{reserva.horario}</td>
              <td>
                <span className={`etiqueta-status etiqueta-status-${reserva.status}`}>
                  {ROTULOS_DE_STATUS[reserva.status]}
                </span>
              </td>
              <td>
                {reserva.status !== 'cancelada' && (
                  <Button variant="outline" onClick={() => cancelar(reserva.id)}>
                    Cancelar
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PainelGestor;
