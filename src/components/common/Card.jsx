/**
 * Container visual padrão (sombra, borda e espaçamento) usado nas páginas.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
function Card({ children, className = '' }) {
  return <div className={`card ${className}`.trim()}>{children}</div>;
}

export default Card;
