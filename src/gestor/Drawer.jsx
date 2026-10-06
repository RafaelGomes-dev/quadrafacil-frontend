import { useEffect, useRef } from 'react';
import Icon from '../components/common/Icon';
export default function Drawer({
  titulo,
  subtitulo,
  children,
  onClose,
  variante = '',
  eyebrow = 'QUADRAFÁCIL · GESTÃO',
}) {
  const ref = useRef(null);
  useEffect(() => {
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector('button')?.focus();
    const fechar = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fechar);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', fechar);
      anterior?.focus();
    };
  }, [onClose]);
  function teclado(e) {
    if (e.key !== 'Tab') return;
    const itens = [
      ...ref.current.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea, a[href]'
      ),
    ];
    if (e.shiftKey && document.activeElement === itens[0]) {
      e.preventDefault();
      itens.at(-1)?.focus();
    } else if (!e.shiftKey && document.activeElement === itens.at(-1)) {
      e.preventDefault();
      itens[0]?.focus();
    }
  }
  return (
    <div
      className={`g-overlay ${variante}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="g-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="g-drawer-titulo"
        ref={ref}
        onKeyDown={teclado}
      >
        <header>
          <div>
            <span className="g-eyebrow">{eyebrow}</span>
            <h2 id="g-drawer-titulo">{titulo}</h2>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <button className="g-icon-btn" aria-label="Fechar painel" onClick={onClose}>
            <Icon name="fechar" />
          </button>
        </header>
        <div className="g-drawer-conteudo">{children}</div>
      </section>
    </div>
  );
}
