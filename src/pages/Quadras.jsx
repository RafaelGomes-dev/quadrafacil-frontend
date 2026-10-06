import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FiltroBusca from '../components/FiltroBusca';
import QuadraCard from '../components/QuadraCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { buscarHorariosDaQuadra, listarQuadras } from '../services/quadraService';
import { ordenarQuadras } from '../utils/apresentacaoQuadras';
import { agruparEstabelecimentos, filtrosDaBusca } from '../utils/estabelecimentos';

/** Página de listagem de quadras com filtros de busca. */
function Quadras() {
  const [parametrosDeBusca, setParametrosDeBusca] = useSearchParams();
  const [quadras, setQuadras] = useState([]);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [mensagemDeErro, setMensagemDeErro] = useState('');
  const [horariosPorQuadra, setHorariosPorQuadra] = useState({});
  const filtrosAtivos = filtrosDaBusca(parametrosDeBusca);
  const dataBuscada = filtrosAtivos.data || '';
  const horarioBuscado = filtrosAtivos.horario || '';
  const buscaAtual = parametrosDeBusca.toString();

  useEffect(() => {
    let cancelado = false;
    setEstaCarregando(true);
    setHorariosPorQuadra({});
    const filtrosDaApi = filtrosDaBusca(buscaAtual);

    listarQuadras(filtrosDaApi)
      .then(async (resultado) => {
        const ordenadas = ordenarQuadras(resultado);
        if (cancelado) return;
        setQuadras(agruparEstabelecimentos(ordenadas));
        setMensagemDeErro('');
        setEstaCarregando(false);

        if (!filtrosDaApi.data) {
          setHorariosPorQuadra({});
          return;
        }

        const grades = await Promise.all(
          ordenadas.map(async (quadra) => {
            try {
              const grade = await buscarHorariosDaQuadra(quadra.id, filtrosDaApi.data);
              return [quadra.id, grade.horariosLivres];
            } catch {
              return [quadra.id, []];
            }
          })
        );
        if (!cancelado) setHorariosPorQuadra(Object.fromEntries(grades));
      })
      .catch((erro) => {
        console.error('Falha ao buscar quadras:', erro);
        if (!cancelado) {
          setMensagemDeErro('Não foi possível buscar as quadras agora. Tente novamente.');
          setEstaCarregando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [buscaAtual]);

  function buscarComFiltros(filtros) {
    const parametros = new URLSearchParams(
      Object.entries(filtros).filter(
        ([campo, valor]) => campo === 'esporte' || (valor !== undefined && valor !== '')
      )
    );
    setParametrosDeBusca(parametros);
  }

  return (
    <div className="pagina-resultados">
      <div className="container">
        <div className="pagina-resultados-cabecalho">
          <span className="sobretitulo">ENCONTRE SEU LUGAR</span>
          <h1>Quadras para o seu próximo jogo</h1>
          <p>Ajuste a busca até encontrar o lugar e o horário que combinam com o seu time.</p>
        </div>

        <FiltroBusca
          key={buscaAtual}
          valoresIniciais={filtrosAtivos}
          onBuscar={buscarComFiltros}
          variant="results"
        />

        <div className="resultados-cabecalho">
          <h2>
            {estaCarregando ? 'Buscando espaços' : `${quadras.length} estabelecimentos encontrados`}
          </h2>
          <span>Curitiba e região</span>
        </div>

        {estaCarregando && <LoadingSpinner mensagem="Buscando quadras..." />}

        {!estaCarregando && mensagemDeErro && <p className="mensagem-erro">{mensagemDeErro}</p>}

        {!estaCarregando && !mensagemDeErro && quadras.length === 0 && (
          <div className="resultados-vazios">
            <h2>Nenhuma quadra corresponde à sua busca.</h2>
            <p>
              Não encontramos {filtrosAtivos.esporte || 'quadras'}{' '}
              {filtrosAtivos.coberta === 'true' ? 'cobertas' : ''}
              {horarioBuscado ? ` às ${horarioBuscado}` : ''}. Experimente alterar o horário ou
              retirar a cobertura.
            </p>
            <button
              className="busca-mais-filtros"
              onClick={() => buscarComFiltros({ esporte: 'society' })}
            >
              Limpar filtros extras
            </button>
          </div>
        )}

        {!estaCarregando && !mensagemDeErro && quadras.length > 0 && (
          <div className="grade-quadras">
            {quadras.map((quadra) => (
              <QuadraCard
                key={quadra.id}
                quadra={quadra}
                filtros={filtrosAtivos}
                data={dataBuscada}
                horarioBuscado={horarioBuscado}
                horarios={[
                  ...new Set(quadra.quadras.flatMap((q) => horariosPorQuadra[q.id] || [])),
                ].sort()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Quadras;
