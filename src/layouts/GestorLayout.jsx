import { NavLink, Outlet, Link } from 'react-router-dom';
import { GestorProvider } from '../gestor/GestorContext';
import { useGestor } from '../gestor/context';
import Icon from '../components/common/Icon';

const links = [
  ['/gestor', 'painel', 'Visão geral'],
  ['/gestor/agenda', 'calendario', 'Agenda'],
  ['/gestor/reservas', 'lista', 'Reservas'],
  ['/gestor/configuracoes', 'config', 'Configurações'],
];
function Estrutura() {
  const { dados } = useGestor();
  return (
    <div className="gestor-shell">
      <aside className="gestor-sidebar">
        <Link to="/gestor" className="gestor-logo">
          <img src="/images/quadrafacil-logo.png" alt="QuadraFácil" />
        </Link>
        <div className="gestor-workspace">
          <span className="gestor-workspace-icone">
            <Icon name="quadra" size={22} />
          </span>
          <div>
            <strong>{dados.estabelecimento.nome}</strong>
            <small>Painel de gestão</small>
          </div>
        </div>
        <small className="gestor-nav-titulo">SEU DIA A DIA</small>
        <nav aria-label="Navegação do gestor">
          {links.map(([to, icone, nome]) => (
            <NavLink key={to} to={to} end={to === '/gestor'}>
              <Icon name={icone} />
              {nome}
            </NavLink>
          ))}
        </nav>
        <div className="gestor-sidebar-final">
          <div className="gestor-dica">
            <Icon name="escudo" />
            <strong>Tudo sob controle.</strong>
            <p>Mais tempo para cuidar do espaço. Menos tempo organizando horários.</p>
          </div>
          <Link to="/user">
            <Icon name="seta" />
            Ver experiência do jogador
          </Link>
          <div className="gestor-perfil">
            <span>GC</span>
            <div>
              <strong>Gestor Curitiba</strong>
              <small>Administrador dos espaços</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="gestor-area">
        <header className="gestor-topbar">
          <span>Seu espaço. Seu ritmo.</span>
          <div>
            <span className="gestor-demo">
              <i />
              Ambiente de demonstração
            </span>
            <span className="gestor-avatar">GC</span>
          </div>
        </header>
        <main className="gestor-conteudo">
          <Outlet />
        </main>
        <footer className="gestor-footer">
          QuadraFácil · Gestão de espaços esportivos{' '}
          <span>Protótipo · alterações salvas neste navegador</span>
        </footer>
      </div>
    </div>
  );
}
export default function GestorLayout() {
  return (
    <GestorProvider>
      <Estrutura />
    </GestorProvider>
  );
}
