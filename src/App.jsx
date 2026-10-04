import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Quadras from './pages/Quadras';
import QuadraDetalhe from './pages/QuadraDetalhe';
import Reserva from './pages/Reserva';
import PainelGestor from './pages/PainelGestor';
import CadastrarQuadra from './pages/CadastrarQuadra';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

/** Raiz do app: roteamento e layout compartilhado (Header + Footer). */
function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="conteudo-principal">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quadras" element={<Quadras />} />
          <Route path="/quadras/:id" element={<QuadraDetalhe />} />
          <Route path="/reserva" element={<Reserva />} />
          <Route path="/painel-gestor" element={<PainelGestor />} />
          <Route path="/cadastrar-quadra" element={<CadastrarQuadra />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
