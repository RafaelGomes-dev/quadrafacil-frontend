import { useMemo } from 'react';

/** Rodapé simples exibido em todas as páginas. */
function Footer() {
  const anoAtual = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="rodape">
      <div className="container rodape-conteudo">
        <p>&copy; {anoAtual} QuadraFacil. Reserva de quadras esportivas em Curitiba.</p>
      </div>
    </footer>
  );
}

export default Footer;
