import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AreaLayout from './layouts/AreaLayout';
import GestorLayout from './layouts/GestorLayout';
import GestorOperacao from './gestor/GestorOperacao';
import Configuracoes from './gestor/Configuracoes';
import Quadras from './pages/Quadras';
import QuadraDetalhe from './pages/EstabelecimentoDetalhe';
import Reserva from './pages/Reserva';
import PainelGestor from './pages/PainelGestor';
import SuperAdmin from './pages/SuperAdmin';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import DemoBar from './components/DemoBar';
import Inteligencia from './gestor/Inteligencia';
import Financeiro from './gestor/Financeiro';
import './styles/demonstracao.css';
import './styles/relatorios.css';

/** Mantém links antigos funcionando enquanto as áreas ganham endereços próprios. */
function LegacyRedirect({ to }) {
  const location = useLocation();
  const pathname = to || `/user${location.pathname}`;

  return <Navigate to={`${pathname}${location.search}`} state={location.state} replace />;
}

function ScrollAoNavegar() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollAoNavegar />
      <DemoBar />
      <div className="demo-content">
        <Routes>
          <Route path="/" element={<Navigate to="/user" replace />} />

          <Route path="/user" element={<AreaLayout area="user" />}>
            <Route index element={<Quadras />} />
            <Route path="quadras" element={<LegacyRedirect to="/user" />} />
            <Route path="quadras/:id" element={<QuadraDetalhe />} />
            <Route path="reserva" element={<Reserva />} />
            <Route path="sobre" element={<LegacyRedirect to="/user" />} />
            <Route path="suporte" element={<Contact />} />
            <Route path="contato" element={<LegacyRedirect to="/user/suporte" />} />
            <Route path="*" element={<NotFound homePath="/user" />} />
          </Route>

          <Route path="/gestor" element={<GestorLayout />}>
            <Route index element={<PainelGestor />} />
            <Route path="agenda" element={<GestorOperacao pagina="agenda" />} />
            <Route path="reservas" element={<GestorOperacao pagina="reservas" />} />
            <Route path="inteligencia" element={<Inteligencia />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="quadras/nova" element={<Navigate to="/gestor/configuracoes" replace />} />
            <Route path="*" element={<NotFound homePath="/gestor" />} />
          </Route>

          <Route path="/superadmin" element={<AreaLayout area="superadmin" />}>
            <Route index element={<SuperAdmin />} />
            <Route path="*" element={<NotFound homePath="/superadmin" />} />
          </Route>

          <Route path="/quadras/*" element={<LegacyRedirect />} />
          <Route path="/reserva" element={<LegacyRedirect />} />
          <Route path="/sobre" element={<LegacyRedirect />} />
          <Route path="/contato" element={<LegacyRedirect />} />
          <Route path="/painel-gestor" element={<LegacyRedirect to="/gestor" />} />
          <Route path="/cadastrar-quadra" element={<LegacyRedirect to="/gestor/quadras/nova" />} />

          <Route element={<AreaLayout area="user" />}>
            <Route path="*" element={<NotFound homePath="/user" />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
