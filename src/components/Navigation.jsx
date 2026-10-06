import { useState } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Menu principal do site. No mobile vira um menu hambúrguer recolhível;
 * a partir do breakpoint de tablet (768px) os links ficam sempre visíveis.
 */
function Navigation({ links }) {
  const [menuAberto, setMenuAberto] = useState(false);

  function alternarMenu() {
    setMenuAberto((estaAberto) => !estaAberto);
  }

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <nav className="navegacao">
      <button
        type="button"
        className="botao-hamburguer"
        aria-label="Abrir menu de navegação"
        aria-expanded={menuAberto}
        onClick={alternarMenu}
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`lista-navegacao ${menuAberto ? 'lista-navegacao-aberta' : ''}`.trim()}>
        {links.map((link) => (
          <li key={link.caminho}>
            <NavLink
              to={link.caminho}
              end={link.end}
              onClick={fecharMenu}
              className={({ isActive }) => (isActive ? 'link-ativo' : undefined)}
            >
              {link.rotulo}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;
