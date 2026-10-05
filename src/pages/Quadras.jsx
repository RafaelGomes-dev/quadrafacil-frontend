import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FiltroBusca from '../components/FiltroBusca';
import QuadraCard from '../components/QuadraCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
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

      {!estaCarregando && mensagemDeErro && (
        <div className="estado-busca-erro">
          <p className="mensagem-erro" role="alert">
            {mensagemDeErro}
          </p>
          <Button onClick={() => buscarQuadras(filtrosAtivos)}>Tentar novamente</Button>
        </div>
      )}

      {!estaCarregando && !mensagemDeErro && quadras.length === 0 && (
        <p className="mensagem-vazia" role="status" aria-live="polite">
          Nenhuma quadra encontrada para esses filtros.
        </p>
      )}

      {!estaCarregando && !mensagemDeErro && quadras.length > 0 && (
        <>
          <p className="resumo-resultados" role="status" aria-live="polite">
            {quadras.length} {quadras.length === 1 ? 'quadra encontrada' : 'quadras encontradas'}.
          </p>
          <div className="grade-quadras">
            {quadras.map((quadra) => (
              <QuadraCard key={quadra.id} quadra={quadra} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Quadras;
