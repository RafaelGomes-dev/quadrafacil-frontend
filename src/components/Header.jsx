import { Link } from 'react-router-dom';
import Navigation from './Navigation';

/** Cabeçalho fixo com a logo do app e o menu de navegação. */
function Header() {
  return (
    <header className="cabecalho">
      <div className="container cabecalho-conteudo">
        <Link to="/" className="logo">
          Quadra<span>Facil</span>
        </Link>
        <Navigation />
      </div>
    </header>
  );
}

export default Header;
