import { useState } from 'react';
import { Link } from 'react-router-dom';

/** Rodapé simples exibido em todas as páginas. */
function Footer() {
  const [anoAtual] = useState(() => new Date().getFullYear());

  return (
    <footer className="rodape product-footer">
      <div className="container rodape-conteudo">
        <div className="product-footer-top">
          <div>
            <strong>QuadraFácil</strong>
            <p>Encontre. Reserve. Jogue.</p>
            <small>Espaços esportivos, pessoas conectadas.</small>
          </div>
          <nav aria-label="Links do rodapé">
            <Link to="/user/suporte">Suporte</Link>
          </nav>
        </div>
        <div className="product-footer-bottom">
          <p>&copy; {anoAtual} QuadraFácil</p>
          <small>Protótipo acadêmico · dados e pagamentos simulados</small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
