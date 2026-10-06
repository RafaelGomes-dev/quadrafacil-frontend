import { useState } from 'react';
import Drawer from '../gestor/Drawer';
import Icon from './common/Icon';
import { formatarData } from '../utils/formatadores';
import { intervaloDoHorario } from '../utils/horariosReserva';
import { registrarInteresse } from '../utils/interesses';
import '../styles/user-refinamentos.css';

export default function InteresseDialog({ tipo, quadra, data, horario, cliente = {}, onClose }) {
  const mensalista = tipo === 'mensalista';
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const diaInicial = new Date(`${data}T12:00:00`).getDay();
  function enviar(evento) {
    evento.preventDefault();
    const campos = Object.fromEntries(new FormData(evento.currentTarget));
    try {
      const registro = {
        ...campos,
        tipo,
        quadraId: String(quadra.id),
        horario: campos.horario || horario,
      };
      if (!mensalista) registro.data = data;
      setResultado(registrarInteresse(registro, window.localStorage));
    } catch {
      setErro('Não foi possível salvar neste navegador. Tente novamente.');
    }
  }
  return (
    <Drawer
      variante="user-interesse-overlay"
      eyebrow="QUADRAFÁCIL · SEU PRÓXIMO JOGO"
      titulo={mensalista ? 'Um horário para chamar de seu' : 'Avise-me ao liberar'}
      onClose={onClose}
    >
      {resultado ? (
        <div className="interesse-sucesso" role="status">
          <Icon name="check" size={30} />
          <h3>
            {resultado.duplicado ? 'Seu interesse já está registrado' : 'Interesse registrado'}
          </h3>
          <p>
            {mensalista
              ? 'Isso não contrata um plano nem garante um horário fixo.'
              : 'Isso não garante a vaga nem altera sua seleção de horários.'}
          </p>
          <small>
            Simulação salva apenas neste navegador. Nenhuma mensagem ou notificação será enviada.
          </small>
          <button className="busca-enviar" onClick={onClose} autoFocus>
            Entendi
          </button>
        </div>
      ) : (
        <form className="user-form" onSubmit={enviar}>
          <div className="interesse-contexto">
            <strong>{quadra.nome}</strong>
            <span>
              {mensalista
                ? 'Escolha sua preferência de horário fixo semanal.'
                : `${formatarData(data)} · ${intervaloDoHorario(horario)}`}
            </span>
          </div>
          <p>
            {mensalista
              ? 'Joga toda semana? Registre seu interesse em ser mensalista deste espaço, sem compromisso.'
              : 'Este horário está ocupado. Registre seu interesse para ser avisado caso a vaga seja liberada.'}
          </p>
          <label>
            Seu nome
            <input name="nome" autoComplete="name" defaultValue={cliente.nome || ''} required />
          </label>
          <label>
            WhatsApp ou e-mail
            <input
              name="contato"
              defaultValue={cliente.telefone || ''}
              placeholder="Seu contato preferido"
              required
              minLength={6}
            />
          </label>
          {mensalista && (
            <div className="user-form-dupla">
              <label>
                Dia da semana
                <select name="diaSemana" defaultValue={Number.isNaN(diaInicial) ? 4 : diaInicial}>
                  {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(
                    (d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    )
                  )}
                </select>
              </label>
              <label>
                A partir de
                <input name="horario" type="time" defaultValue={horario} required />
              </label>
            </div>
          )}
          <small>
            Protótipo: apenas registro local, sem envio de mensagens.{' '}
            {mensalista
              ? 'Valores e disponibilidade serão combinados com o gestor.'
              : 'A vaga só será sua após uma nova reserva confirmada.'}
          </small>
          {erro && (
            <p role="alert" className="mensagem-erro">
              {erro}
            </p>
          )}
          <button className="busca-enviar" type="submit">
            {mensalista ? 'Registrar interesse' : 'Avise-me ao liberar'}{' '}
            <Icon name="seta" size={18} />
          </button>
        </form>
      )}
    </Drawer>
  );
}
