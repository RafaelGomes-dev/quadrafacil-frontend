import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FiltroBusca from '../components/FiltroBusca';
import QuadraCard from '../components/QuadraCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { listarQuadras } from '../services/quadraService';

/** Página de listagem de quadras com filtros de busca. */
function Quadras() {
  const [parametrosDeBusca] = useSearchParams();
  const [quadras, setQuadras] = useState([]);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [mensagemDeErro, setMensagemDeErro] = useState('');
  const [filtrosAtivos, setFiltrosAtivos] = useState(
    Object.fromEntries(parametrosDeBusca.entries())
  );

  const buscarQuadras = useCallback((filtros) => {
    setEstaCarregando(true);
    setMensagemDeErro('');

    listarQuadras(filtros)
      .then(setQuadras)
      .catch((erro) => {
        console.error('Falha ao buscar quadras:', erro);
        setMensagemDeErro('Não foi possível buscar as quadras agora. Tente novamente.');
      })
      .finally(() => setEstaCarregando(false));
  }, []);

  useEffect(() => {
    buscarQuadras(filtrosAtivos);
  }, [buscarQuadras, filtrosAtivos]);

  return (
    <div className="container pagina-quadras">
      <h1>Quadras disponíveis</h1>

      <FiltroBusca valoresIniciais={filtrosAtivos} onBuscar={setFiltrosAtivos} />

      {estaCarregando && <LoadingSpinner mensagem="Buscando quadras..." />}

      {!estaCarregando && mensagemDeErro && <p className="mensagem-erro">{mensagemDeErro}</p>}

      {!estaCarregando && !mensagemDeErro && quadras.length === 0 && (
        <p className="mensagem-vazia">Nenhuma quadra encontrada para esses filtros.</p>
      )}

      {!estaCarregando && !mensagemDeErro && quadras.length > 0 && (
        <div className="grade-quadras">
          {quadras.map((quadra) => (
            <QuadraCard key={quadra.id} quadra={quadra} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Quadras;
