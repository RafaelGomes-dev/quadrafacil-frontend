import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { cadastrarQuadra } from '../services/quadraService';
import { validarHorarioDeFuncionamento } from '../utils/quadra';

const VALORES_INICIAIS = {
  nome: '',
  endereco: '',
  cidade: '',
  bairro: '',
  esporte: 'society',
  precoHora: '',
  descricao: '',
  estrutura: { vestiario: false, estacionamento: false, iluminacao: false, coberta: false },
  horarioFuncionamento: { abertura: '08:00', fechamento: '22:00' },
};

/** Valida no front os mesmos campos obrigatórios exigidos pela API. */
function validarFormulario(dadosDoFormulario) {
  const erros = [];
  if (!dadosDoFormulario.nome.trim()) erros.push('Informe o nome da quadra.');
  if (!dadosDoFormulario.endereco.trim()) erros.push('Informe o endereço.');
  if (!dadosDoFormulario.cidade.trim()) erros.push('Informe a cidade.');
  if (!dadosDoFormulario.esporte.trim()) erros.push('Selecione o esporte.');
  if (!dadosDoFormulario.precoHora || Number(dadosDoFormulario.precoHora) <= 0) {
    erros.push('O preço por hora precisa ser maior que zero.');
  }
  const erroDeHorario = validarHorarioDeFuncionamento(dadosDoFormulario.horarioFuncionamento);
  if (erroDeHorario) erros.push(erroDeHorario);
  return erros;
}

/** Formulário de cadastro de quadra pelo gestor/proprietário. */
function CadastrarQuadra() {
  const navegar = useNavigate();
  const [dadosDoFormulario, setDadosDoFormulario] = useState(VALORES_INICIAIS);
  const [errosDeValidacao, setErrosDeValidacao] = useState([]);
  const [estaEnviando, setEstaEnviando] = useState(false);

  function atualizarCampo(nomeDoCampo, valor) {
    setDadosDoFormulario((dadosAtuais) => ({ ...dadosAtuais, [nomeDoCampo]: valor }));
  }

  function alternarEstrutura(chave) {
    setDadosDoFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      estrutura: { ...dadosAtuais.estrutura, [chave]: !dadosAtuais.estrutura[chave] },
    }));
  }

  function atualizarHorario(chave, valor) {
    setDadosDoFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      horarioFuncionamento: { ...dadosAtuais.horarioFuncionamento, [chave]: valor },
    }));
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();
    const errosDoFormulario = validarFormulario(dadosDoFormulario);
    if (errosDoFormulario.length > 0) {
      setErrosDeValidacao(errosDoFormulario);
      return;
    }

    setErrosDeValidacao([]);
    setEstaEnviando(true);

    try {
      const quadraCriada = await cadastrarQuadra({
        ...dadosDoFormulario,
        precoHora: Number(dadosDoFormulario.precoHora),
      });
      navegar('/gestor', { state: { quadraCadastrada: quadraCriada.nome } });
    } catch (erro) {
      console.error('Falha ao cadastrar quadra:', erro);
      setErrosDeValidacao(
        erro.response?.data?.detalhes || ['Não foi possível cadastrar a quadra.']
      );
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <div className="container pagina-cadastrar-quadra">
      <h1>Cadastrar quadra</h1>

      <form onSubmit={enviarFormulario} className="formulario-cadastro">
        <label className="campo-formulario">
          Nome
          <input
            type="text"
            value={dadosDoFormulario.nome}
            onChange={(evento) => atualizarCampo('nome', evento.target.value)}
          />
        </label>

        <label className="campo-formulario">
          Endereço
          <input
            type="text"
            value={dadosDoFormulario.endereco}
            onChange={(evento) => atualizarCampo('endereco', evento.target.value)}
          />
        </label>

        <label className="campo-formulario">
          Cidade
          <input
            type="text"
            value={dadosDoFormulario.cidade}
            onChange={(evento) => atualizarCampo('cidade', evento.target.value)}
          />
        </label>

        <label className="campo-formulario">
          Bairro
          <input
            type="text"
            value={dadosDoFormulario.bairro}
            onChange={(evento) => atualizarCampo('bairro', evento.target.value)}
          />
        </label>

        <label className="campo-formulario">
          Esporte
          <select
            value={dadosDoFormulario.esporte}
            onChange={(evento) => atualizarCampo('esporte', evento.target.value)}
          >
            <option value="society">Society</option>
            <option value="futsal">Futsal</option>
            <option value="campo">Campo</option>
            <option value="volei">Vôlei</option>
            <option value="beach tennis">Beach Tennis</option>
            <option value="basquete">Basquete</option>
          </select>
        </label>

        <label className="campo-formulario">
          Preço por hora (R$)
          <input
            type="number"
            min="0"
            step="0.01"
            value={dadosDoFormulario.precoHora}
            onChange={(evento) => atualizarCampo('precoHora', evento.target.value)}
          />
        </label>

        <fieldset className="opcoes-horario">
          <legend>Horário de funcionamento</legend>
          <label className="campo-formulario">
            Abre às
            <input
              type="time"
              value={dadosDoFormulario.horarioFuncionamento.abertura}
              onChange={(evento) => atualizarHorario('abertura', evento.target.value)}
            />
          </label>
          <label className="campo-formulario">
            Fecha às
            <input
              type="time"
              value={dadosDoFormulario.horarioFuncionamento.fechamento}
              onChange={(evento) => atualizarHorario('fechamento', evento.target.value)}
            />
          </label>
        </fieldset>

        <label className="campo-formulario">
          Descrição
          <textarea
            value={dadosDoFormulario.descricao}
            onChange={(evento) => atualizarCampo('descricao', evento.target.value)}
          />
        </label>

        <fieldset className="opcoes-estrutura">
          <legend>Estrutura</legend>
          {Object.keys(dadosDoFormulario.estrutura).map((chave) => (
            <label key={chave}>
              <input
                type="checkbox"
                checked={dadosDoFormulario.estrutura[chave]}
                onChange={() => alternarEstrutura(chave)}
              />
              {chave}
            </label>
          ))}
        </fieldset>

        {errosDeValidacao.length > 0 && (
          <ul className="lista-erros">
            {errosDeValidacao.map((erro) => (
              <li key={erro} className="mensagem-erro">
                {erro}
              </li>
            ))}
          </ul>
        )}

        <Button type="submit" disabled={estaEnviando}>
          {estaEnviando ? 'Cadastrando...' : 'Cadastrar quadra'}
        </Button>
      </form>
    </div>
  );
}

export default CadastrarQuadra;
