import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AreaLayout from './layouts/AreaLayout';
import Home from './pages/Home';
import Quadras from './pages/Quadras';
import QuadraDetalhe from './pages/QuadraDetalhe';
import Reserva from './pages/Reserva';
import PainelGestor from './pages/PainelGestor';
import CadastrarQuadra from './pages/CadastrarQuadra';
import SuperAdmin from './pages/SuperAdmin';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

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
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />

        <Route path="/user" element={<AreaLayout area="user" />}>
          <Route index element={<Home />} />
          <Route path="quadras" element={<Quadras />} />
          <Route path="quadras/:id" element={<QuadraDetalhe />} />
          <Route path="reserva" element={<Reserva />} />
          <Route path="sobre" element={<About />} />
          <Route path="contato" element={<Contact />} />
          <Route path="*" element={<NotFound homePath="/user" />} />
        </Route>

        <Route path="/gestor" element={<AreaLayout area="gestor" />}>
          <Route index element={<PainelGestor />} />
          <Route path="quadras/nova" element={<CadastrarQuadra />} />
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
    </BrowserRouter>
  );
}

export default App;
