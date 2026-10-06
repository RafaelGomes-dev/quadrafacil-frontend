import { NavLink, Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { contaDemo } from '../superadmin/model';
import { GestorProvider } from '../gestor/GestorContext';
import { useGestor } from '../gestor/context';
import Icon from '../components/common/Icon';
import Footer from '../components/Footer';

const links = [
  ['/gestor', 'painel', 'Visão geral'],
  ['/gestor/agenda', 'calendario', 'Agenda'],
  ['/gestor/reservas', 'lista', 'Reservas'],
  ['/gestor/financeiro', 'dinheiro', 'Financeiro'],
  ['/gestor/inteligencia', 'insights', 'Inteligência'],
  ['/gestor/configuracoes', 'config', 'Configurações'],
];
function Estrutura() {
  const { dados } = useGestor();
  const conta = contaDemo();
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
          <div className="gestor-perfil">
            <span>GC</span>
            <div>
              <strong>{conta?.nome || 'Gestor'}</strong>
              <small>Administrador · demonstração</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="gestor-area">
        <main className="gestor-conteudo">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
export default function GestorLayout() {
  const [conta, setConta] = useState(contaDemo);
  useEffect(() => {
    const atualizar = () => setConta(contaDemo());
    window.addEventListener('storage', atualizar);
    window.addEventListener('quadrafacil-admin', atualizar);
    return () => {
      window.removeEventListener('storage', atualizar);
      window.removeEventListener('quadrafacil-admin', atualizar);
    };
  }, []);
  if (conta?.status === 'revogada')
    return (
      <>
        <div className="container pagina-institucional">
          <span className="sobretitulo">ACESSO DO GESTOR · SIMULAÇÃO</span>
          <h1>Acesso revogado pela equipe.</h1>
          <p>
            O painel está indisponível nesta demonstração. As quadras e reservas foram preservadas.
          </p>
          <p>
            <strong>Motivo:</strong> {conta.motivo}
          </p>
          <Link to="/user">Voltar ao site</Link>
          <p>Não há autenticação real neste protótipo.</p>
        </div>
        <Footer />
      </>
    );
  return (
    <GestorProvider>
      <Estrutura />
    </GestorProvider>
  );
}
