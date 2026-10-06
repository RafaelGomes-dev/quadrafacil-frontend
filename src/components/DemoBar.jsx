import { NavLink } from 'react-router-dom';

/** Navegação temporária, fora das permissões e menus do produto final. */
export default function DemoBar() {
  return (
    <aside className="demo-switcher" aria-label="Controles temporários da demonstração">
      <span>
        <b>DEMO</b>
        <small>Troca de área · removível no produto final</small>
      </span>
      <nav aria-label="Trocar área da demonstração">
        <NavLink to="/user">Jogador</NavLink>
        <NavLink to="/gestor">Gestor</NavLink>
        <NavLink to="/superadmin">Superadmin</NavLink>
      </nav>
    </aside>
  );
}
