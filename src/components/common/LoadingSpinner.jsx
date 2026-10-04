/**
 * Indicador de carregamento usado enquanto dados são buscados na API.
 * @param {object} props
 * @param {string} [props.mensagem]
 */
function LoadingSpinner({ mensagem = 'Carregando...' }) {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{mensagem}</p>
    </div>
  );
}

export default LoadingSpinner;
