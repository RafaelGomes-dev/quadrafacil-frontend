import { Link } from 'react-router-dom';
import Navigation from './Navigation';

/** Cabeçalho da área ativa, com navegação específica para seu público. */
function Header({ homePath, areaLabel, links }) {
  return (
    <header className="cabecalho">
      <div className="container cabecalho-conteudo">
        <Link to={homePath} className="logo">
          {homePath === '/user' ? (
            <img src="/images/quadrafacil-logo.png" alt="QuadraFácil" />
          ) : (
            <>
              Quadra<span>Facil</span>
            </>
          )}
          {areaLabel && <small className="logo-area">{areaLabel}</small>}
        </Link>
        <Navigation links={links} />
      </div>
    </header>
  );
}

export default Header;
