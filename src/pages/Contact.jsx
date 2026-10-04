import { useState } from 'react';
import Button from '../components/common/Button';

/** Formulário de contato (mock — não envia para nenhum backend nesta etapa). */
function Contact() {
  const [mensagemEnviada, setMensagemEnviada] = useState(false);

  function enviarFormulario(evento) {
    evento.preventDefault();
    setMensagemEnviada(true);
  }

  return (
    <div className="container pagina-institucional">
      <h1>Contato</h1>
      <p>Dúvidas, sugestões ou parcerias? Fale com a equipe do QuadraFacil.</p>

      {mensagemEnviada ? (
        <p className="mensagem-sucesso">Mensagem enviada! Em breve retornaremos o contato.</p>
      ) : (
        <form onSubmit={enviarFormulario} className="formulario-contato">
          <label className="campo-formulario">
            Nome
            <input type="text" required />
          </label>
          <label className="campo-formulario">
            E-mail
            <input type="email" required />
          </label>
          <label className="campo-formulario">
            Mensagem
            <textarea required />
          </label>
          <Button type="submit">Enviar mensagem</Button>
        </form>
      )}
    </div>
  );
}

export default Contact;
