import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import APITest from '../components/APITest';
import FiltroBusca from '../components/FiltroBusca';
import QuadraCard from '../components/QuadraCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { listarQuadras } from '../services/quadraService';

const QUANTIDADE_DE_DESTAQUES = 3;

/** Página inicial: hero com busca rápida e quadras em destaque. */
function Home() {
  const navegar = useNavigate();
  const [quadrasEmDestaque, setQuadrasEmDestaque] = useState([]);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [mensagemDeErro, setMensagemDeErro] = useState('');

  useEffect(() => {
    let cancelado = false;

    listarQuadras()
      .then((quadras) => {
        if (!cancelado) setQuadrasEmDestaque(quadras.slice(0, QUANTIDADE_DE_DESTAQUES));
      })
      .catch((erro) => {
        console.error('Falha ao carregar quadras em destaque:', erro);
        if (!cancelado) setMensagemDeErro('Não foi possível carregar os destaques agora.');
      })
      .finally(() => {
        if (!cancelado) setEstaCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  function buscarComFiltros(filtros) {
    const parametros = new URLSearchParams(
      Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor))
    );
    navegar(`/user/quadras?${parametros.toString()}`);
  }

  return (
    <div className="pagina-home">
      <section className="hero">
        <div className="container hero-conteudo">
          <h1>Reserve sua quadra em minutos</h1>
          <p>Compare preços, estrutura e horários livres sem trocar mensagem no WhatsApp.</p>
          <FiltroBusca
            camposVisiveis={['cidade', 'data', 'horario', 'esporte']}
            onBuscar={buscarComFiltros}
          />
          <APITest />
        </div>
      </section>

      <section className="container secao-destaques">
        <h2>Quadras em destaque</h2>
        {estaCarregando && <LoadingSpinner mensagem="Carregando destaques..." />}
        {!estaCarregando && mensagemDeErro && <p className="mensagem-erro">{mensagemDeErro}</p>}
        {!estaCarregando && !mensagemDeErro && (
          <div className="grade-quadras">
            {quadrasEmDestaque.map((quadra) => (
              <QuadraCard key={quadra.id} quadra={quadra} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
