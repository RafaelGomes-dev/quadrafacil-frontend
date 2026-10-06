import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AREAS = {
  user: {
    homePath: '/user',
    label: '',
    links: [
      { caminho: '/user', rotulo: 'Início', end: true },
      { caminho: '/user/quadras', rotulo: 'Quadras' },
      { caminho: '/gestor', rotulo: 'Área do gestor', end: true },
    ],
  },
  gestor: {
    homePath: '/gestor',
    label: 'Gestor',
    links: [
      { caminho: '/gestor', rotulo: 'Painel', end: true },
      { caminho: '/gestor/quadras/nova', rotulo: 'Cadastrar quadra' },
      { caminho: '/user', rotulo: 'Ver site', end: true },
    ],
  },
  superadmin: {
    homePath: '/superadmin',
    label: 'Administração',
    links: [
      { caminho: '/superadmin', rotulo: 'Início', end: true },
      { caminho: '/user', rotulo: 'Ver site', end: true },
    ],
  },
};

/** Cada público compartilha a estrutura, mas tem menu e endereço próprios. */
function AreaLayout({ area }) {
  const config = AREAS[area];
  const { pathname } = useLocation();
  const comBarraReserva = area === 'user' && /^\/user\/quadras\/[^/]+$/.test(pathname);

  return (
    <div className={`area-shell area-${area}${comBarraReserva ? ' com-barra-reserva' : ''}`}>
      <Header homePath={config.homePath} areaLabel={config.label} links={config.links} />
      <main className="conteudo-principal">
        <Outlet />
      </main>
      <Footer area={area} />
    </div>
  );
}

export default AreaLayout;
