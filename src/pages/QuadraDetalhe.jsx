import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeletorHorario from '../components/SeletorHorario';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { buscarHorariosDaQuadra, buscarQuadraPorId } from '../services/quadraService';
import { formatarDataLocalISO } from '../utils/data';

const ITENS_DE_ESTRUTURA = [
  { chave: 'vestiario', rotulo: 'Vestiário' },
  { chave: 'estacionamento', rotulo: 'Estacionamento' },
  { chave: 'iluminacao', rotulo: 'Iluminação' },
  { chave: 'coberta', rotulo: 'Quadra coberta' },
];

/** Perfil da quadra: estrutura, fotos e grade de horários para reserva. */
function QuadraDetalhe() {
  const { id } = useParams();
  const navegar = useNavigate();
  const dataMinima = formatarDataLocalISO();

  const [quadra, setQuadra] = useState(null);
  const [dataEscolhida, setDataEscolhida] = useState(dataMinima);
  const [horarios, setHorarios] = useState({ horariosLivres: [], horariosOcupados: [] });
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [erroDaQuadra, setErroDaQuadra] = useState('');
  const [erroDosHorarios, setErroDosHorarios] = useState('');

  useEffect(() => {
    let cancelado = false;
    setErroDaQuadra('');
    buscarQuadraPorId(id)
      .then((quadraEncontrada) => {
        if (!cancelado) setQuadra(quadraEncontrada);
      })
      .catch((erro) => {
        console.error('Falha ao carregar quadra:', erro);
        if (!cancelado) setErroDaQuadra('Quadra não encontrada.');
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelado = false;
    setEstaCarregando(true);
    setErroDosHorarios('');
    setHorarioSelecionado('');

    buscarHorariosDaQuadra(id, dataEscolhida)
      .then((grade) => {
        if (!cancelado) setHorarios(grade);
      })
      .catch((erro) => {
        console.error('Falha ao carregar horários:', erro);
        if (!cancelado) setErroDosHorarios('Não foi possível carregar os horários desta data.');
      })
      .finally(() => {
        if (!cancelado) setEstaCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id, dataEscolhida]);

  function irParaReserva() {
    navegar('/reserva', {
      state: { quadraId: id, data: dataEscolhida, horario: horarioSelecionado },
    });
  }

  if (erroDaQuadra && !quadra) {
    return (
      <p className="container mensagem-erro" role="alert">
        {erroDaQuadra}
      </p>
    );
  }

  if (!quadra) {
    return <LoadingSpinner mensagem="Carregando quadra..." />;
  }

  return (
    <div className="container pagina-quadra-detalhe">
      <h1>{quadra.nome}</h1>
      <p className="quadra-card-local">
        {quadra.endereco} — {quadra.bairro ? `${quadra.bairro}, ` : ''}
        {quadra.cidade}
      </p>

      {quadra.fotos?.[0] && <img src={quadra.fotos[0]} alt={`Foto da quadra ${quadra.nome}`} />}

      <p>{quadra.descricao}</p>
      <p className="quadra-card-preco">
        R$ {quadra.precoHora.toFixed(2)} <small>/hora</small>
      </p>

      <h2>Estrutura</h2>
      <ul className="lista-estrutura">
        {ITENS_DE_ESTRUTURA.map((item) => (
          <li key={item.chave}>
            {quadra.estrutura?.[item.chave] ? '✅' : '❌'} {item.rotulo}
          </li>
        ))}
      </ul>

      <h2>Escolha o horário</h2>
      <label className="campo-formulario">
        Data
        <input
          type="date"
          min={dataMinima}
          required
          value={dataEscolhida}
          onChange={(evento) => setDataEscolhida(evento.target.value)}
        />
      </label>

      {erroDosHorarios ? (
        <p className="mensagem-erro" role="alert">
          {erroDosHorarios}
        </p>
      ) : estaCarregando ? (
        <LoadingSpinner mensagem="Carregando horários..." />
      ) : (
        <SeletorHorario
          horariosLivres={horarios.horariosLivres}
          horariosOcupados={horarios.horariosOcupados}
          horarioSelecionado={horarioSelecionado}
          onSelecionarHorario={setHorarioSelecionado}
        />
      )}

      <Button
        disabled={!horarioSelecionado || estaCarregando || Boolean(erroDosHorarios)}
        onClick={irParaReserva}
      >
        Reservar horário {horarioSelecionado}
      </Button>
    </div>
  );
}

export default QuadraDetalhe;
