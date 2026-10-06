import { useMemo } from 'react';
import { Link } from 'react-router-dom';

/** Rodapé simples exibido em todas as páginas. */
function Footer({ area }) {
  const anoAtual = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="rodape">
      <div className="container rodape-conteudo">
        {area === 'user' ? (
          <>
            <div className="rodape-topo">
              <div className="rodape-marca">
                <strong>QuadraFácil</strong>
                <p>Encontre. Reserve. Jogue.</p>
                <small>Seu próximo jogo, em Curitiba e região.</small>
              </div>
              <nav aria-label="Links do rodapé">
                <Link to="/user/quadras">Encontrar quadras</Link>
                <Link to="/user/sobre">Sobre o QuadraFácil</Link>
                <Link to="/user/contato">Contato</Link>
                <Link to="/gestor">Área do gestor</Link>
              </nav>
            </div>
            <div className="rodape-base">
              <p>&copy; {anoAtual} QuadraFácil</p>
              <small>Protótipo acadêmico · reservas e pagamentos simulados</small>
            </div>
          </>
        ) : (
          <p>&copy; {anoAtual} QuadraFácil. Reserva de quadras esportivas em Curitiba.</p>
        )}
      </div>
    </footer>
  );
}

export default Footer;
