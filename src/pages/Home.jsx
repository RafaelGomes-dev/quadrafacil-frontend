import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FiltroBusca from '../components/FiltroBusca';
import QuadraCard from '../components/QuadraCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { listarQuadras } from '../services/quadraService';
import { ordenarQuadras } from '../utils/apresentacaoQuadras';
import { agruparEstabelecimentos } from '../utils/estabelecimentos';

/** Página inicial: hero com busca rápida e quadras em destaque. */
function Home() {
  const navegar = useNavigate();
  const [quadras, setQuadras] = useState([]);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [mensagemDeErro, setMensagemDeErro] = useState('');

  useEffect(() => {
    let cancelado = false;

    listarQuadras({ esporte: 'society' })
      .then((quadras) => {
        if (!cancelado) setQuadras(agruparEstabelecimentos(ordenarQuadras(quadras)));
      })
      .catch((erro) => {
        console.error('Falha ao carregar quadras em destaque:', erro);
        if (!cancelado) setMensagemDeErro('Não foi possível carregar as quadras agora.');
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
      Object.fromEntries(
        Object.entries(filtros).filter(([campo, valor]) => campo === 'esporte' || valor)
      )
    );
    navegar(`/user/quadras?${parametros.toString()}`);
  }

  return (
    <div className="pagina-home">
      <section className="hero">
        <div className="container">
          <div className="hero-grade">
            <div className="hero-conteudo">
              <span className="sobretitulo">QUADRAFÁCIL · CURITIBA</span>
              <h1>O próximo jogo começa por aqui.</h1>
              <p>
                Encontre a quadra certa, escolha o melhor horário e deixe o grupo pronto para jogar.
              </p>
              <div className="hero-detalhe">
                <span className="hero-detalhe-icone">↗</span>
                Uma forma mais simples de reunir todo mundo.
              </div>
            </div>
            <div className="hero-visual">
              <img src="/images/society.jpg" alt="Quadra de futebol society ao fim da tarde" />
              <span className="hero-visual-legenda">Seu lugar em quadra está esperando.</span>
            </div>
          </div>

          <div className="hero-busca">
            <div className="hero-busca-titulo">
              <span className="sobretitulo">ENCONTRE SUA QUADRA</span>
              <h2>Onde vamos jogar?</h2>
            </div>
            <FiltroBusca onBuscar={buscarComFiltros} />
          </div>
        </div>
      </section>

      <section className="container secao-quadras">
        <div className="secao-cabecalho">
          <div>
            <span className="sobretitulo">PRA TODO TIPO DE PARTIDA</span>
            <h2>Escolha a sua quadra</h2>
            <p>Espaços selecionados para transformar a vontade de jogar em partida marcada.</p>
          </div>
          <span className="secao-contagem">{quadras.length} estabelecimentos em Curitiba</span>
        </div>
        {estaCarregando && <LoadingSpinner mensagem="Carregando quadras..." />}
        {!estaCarregando && mensagemDeErro && <p className="mensagem-erro">{mensagemDeErro}</p>}
        {!estaCarregando && !mensagemDeErro && (
          <div className="grade-quadras">
            {quadras.map((quadra) => (
              <QuadraCard key={quadra.id} quadra={quadra} filtros={{ esporte: 'society' }} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
