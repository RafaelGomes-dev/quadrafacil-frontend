/**
 * Botão reutilizável com variantes visuais.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {'primary'|'secondary'|'outline'} [props.variant]
 * @param {'button'|'submit'} [props.type]
 * @param {boolean} [props.disabled]
 * @param {() => void} [props.onClick]
 */
function Button({ children, variant = 'primary', type = 'button', disabled = false, onClick }) {
  return (
    <button type={type} className={`botao botao-${variant}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
