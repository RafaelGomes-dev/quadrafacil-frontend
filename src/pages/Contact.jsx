import { useState } from 'react';
import Icon from '../components/common/Icon';
import { Link } from 'react-router-dom';
import '../styles/user-refinamentos.css';

/** Formulário de contato (mock — não envia para nenhum backend nesta etapa). */
function Contact() {
  const [mensagemEnviada, setMensagemEnviada] = useState(false);

  function enviarFormulario(evento) {
    evento.preventDefault();
    setMensagemEnviada(true);
  }

  return (
    <div className="container suporte-pagina">
      <Link className="detalhe-voltar" to="/user">
        <Icon name="voltar" size={18} /> Voltar à busca
      </Link>
      <div className="suporte-layout">
        <section className="suporte-intro">
          <span className="sobretitulo">ESTAMOS POR AQUI</span>
          <h1>Como podemos ajudar?</h1>
          <p>Uma dúvida sobre sua partida ou uma ideia para melhorar? Conte para a gente.</p>
          <div className="suporte-topico">
            <Icon name="calendario" />
            <div>
              <strong>Sua reserva</strong>
              <p>Horários, confirmação e alterações.</p>
            </div>
          </div>
          <div className="suporte-topico">
            <Icon name="quadra" />
            <div>
              <strong>Sua experiência</strong>
              <p>Ajuda para encontrar o espaço certo.</p>
            </div>
          </div>
          <small>
            Este é um protótipo. O formulário simula o atendimento, sem enviar mensagens.
          </small>
        </section>
        <section className="suporte-card">
          {mensagemEnviada ? (
            <div className="interesse-sucesso" role="status">
              <Icon name="check" size={32} />
              <h2>Simulação concluída</h2>
              <p>
                Assim será a abertura de um atendimento. Nesta demonstração, nenhuma mensagem foi
                enviada.
              </p>
              <button className="busca-enviar" onClick={() => setMensagemEnviada(false)}>
                Nova mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={enviarFormulario} className="user-form">
              <h2>Fale com o suporte</h2>
              <div className="user-form-dupla">
                <label>
                  Seu nome
                  <input
                    name="nome"
                    autoComplete="name"
                    placeholder="Como podemos te chamar?"
                    required
                  />
                </label>
                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@email.com"
                    required
                  />
                </label>
              </div>
              <label>
                Assunto
                <select name="assunto">
                  <option>Ajuda com uma reserva</option>
                  <option>Dúvida sobre uma quadra</option>
                  <option>Sugestão ou problema no site</option>
                  <option>Outro assunto</option>
                </select>
              </label>
              <label>
                <span>
                  Código da reserva <span className="user-opcional">(opcional)</span>
                </span>
                <input name="reserva" placeholder="Se tiver, informe aqui" />
              </label>
              <label>
                Sua mensagem
                <textarea
                  name="mensagem"
                  placeholder="Conte o que aconteceu ou como podemos ajudar…"
                  rows="5"
                  required
                  minLength={10}
                />
              </label>
              <button className="busca-enviar" type="submit">
                Simular envio <Icon name="seta" size={18} />
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default Contact;
