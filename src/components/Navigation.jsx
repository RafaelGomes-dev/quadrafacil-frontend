import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const LINKS_DE_NAVEGACAO = [
  { caminho: '/', rotulo: 'Início' },
  { caminho: '/quadras', rotulo: 'Quadras' },
  { caminho: '/painel-gestor', rotulo: 'Painel do Gestor' },
  { caminho: '/cadastrar-quadra', rotulo: 'Cadastrar Quadra' },
  { caminho: '/sobre', rotulo: 'Sobre' },
  { caminho: '/contato', rotulo: 'Contato' },
];

/**
 * Menu principal do site. No mobile vira um menu hambúrguer recolhível;
 * a partir do breakpoint de tablet (768px) os links ficam sempre visíveis.
 */
function Navigation() {
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
        {LINKS_DE_NAVEGACAO.map((link) => (
          <li key={link.caminho}>
            <NavLink
              to={link.caminho}
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
