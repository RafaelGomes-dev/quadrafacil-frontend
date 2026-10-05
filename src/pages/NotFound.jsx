import { Link } from 'react-router-dom';

/** Página exibida para qualquer rota não mapeada (fallback "*"). */
function NotFound() {
  return (
    <div className="container pagina-nao-encontrada">
      <h1>404</h1>
      <p>Ops! Essa página não existe ou foi removida.</p>
      <Link to="/">Voltar para a Home</Link>
    </div>
  );
}

export default NotFound;
