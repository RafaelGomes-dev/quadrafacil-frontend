import { Link } from 'react-router-dom';

/** Página exibida para qualquer rota não mapeada (fallback "*"). */
function NotFound({ homePath = '/user' }) {
  return (
    <div className="container pagina-nao-encontrada">
      <h1>404</h1>
      <p>Ops! Essa página não existe ou foi removida.</p>
      <Link to={homePath}>Voltar para o início</Link>
    </div>
  );
}

export default NotFound;
