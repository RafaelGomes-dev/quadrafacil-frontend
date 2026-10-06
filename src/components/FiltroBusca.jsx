import { useState } from 'react';
import Icon from './common/Icon';
import { formatarDataLocalISO } from '../utils/data';

const OPCOES_DE_ESPORTE = [
  { valor: '', rotulo: 'Todos os esportes' },
  { valor: 'society', rotulo: 'Society' },
  { valor: 'futsal', rotulo: 'Futsal' },
  { valor: 'campo', rotulo: 'Campo' },
  { valor: 'volei', rotulo: 'Vôlei' },
  { valor: 'beach tennis', rotulo: 'Beach Tennis' },
  { valor: 'basquete', rotulo: 'Basquete' },
];

const FILTROS_PADRAO = {
  bairro: '',
  esporte: '',
  data: '',
  horario: '',
  coberta: '',
  precoMin: '',
  precoMax: '',
};

/** Busca principal com opções avançadas recolhidas para manter a tela leve. */
function FiltroBusca({ valoresIniciais = {}, onBuscar, variant = 'hero' }) {
  const [filtros, setFiltros] = useState({ ...FILTROS_PADRAO, ...valoresIniciais });
  const [maisFiltrosAbertos, setMaisFiltrosAbertos] = useState(false);
  const filtrosExtrasAtivos = ['horario', 'coberta', 'precoMin', 'precoMax'].filter(
    (campo) => filtros[campo]
  ).length;

  function atualizarCampo(nomeDoCampo, valor) {
    setFiltros((filtrosAtuais) => ({ ...filtrosAtuais, [nomeDoCampo]: valor }));
  }

  function lidarComEnvio(evento) {
    evento.preventDefault();
    onBuscar(filtros);
  }

  return (
    <form className={`busca-form busca-form-${variant}`} onSubmit={lidarComEnvio}>
      <div className="busca-campos-principais">
        <label className="busca-campo">
          <span>Onde jogar</span>
          <span className="busca-campo-controle">
            <Icon name="local" size={19} />
            <input
              type="text"
              value={filtros.bairro}
              placeholder="Bairro ou região"
              onChange={(evento) => atualizarCampo('bairro', evento.target.value)}
            />
          </span>
        </label>

        <label className="busca-campo">
          <span>Data</span>
          <span className="busca-campo-controle">
            <Icon name="calendario" size={19} />
            <input
              type="date"
              min={formatarDataLocalISO()}
              value={filtros.data}
              onInput={(evento) => atualizarCampo('data', evento.currentTarget.value)}
              onChange={(evento) => atualizarCampo('data', evento.target.value)}
            />
          </span>
        </label>

        <label className="busca-campo">
          <span>Esporte</span>
          <span className="busca-campo-controle">
            <select
              value={filtros.esporte}
              onChange={(evento) => atualizarCampo('esporte', evento.target.value)}
            >
              {OPCOES_DE_ESPORTE.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </span>
        </label>

        <button className="busca-enviar" type="submit">
          <Icon name="busca" size={20} />
          <span>Buscar quadras</span>
        </button>
      </div>

      <div className="busca-rodape">
        <button
          className="busca-mais-filtros"
          type="button"
          aria-expanded={maisFiltrosAbertos}
          onClick={() => setMaisFiltrosAbertos((abertos) => !abertos)}
        >
          <Icon name="filtros" size={17} />
          Mais filtros{filtrosExtrasAtivos > 0 ? ` · ${filtrosExtrasAtivos}` : ''}
        </button>
        <span>Encontre o espaço certo para o seu jogo.</span>
      </div>

      {maisFiltrosAbertos && (
        <div className="busca-filtros-extras">
          <label className="busca-campo">
            <span>Horário</span>
            <input
              type="time"
              value={filtros.horario}
              onChange={(evento) => atualizarCampo('horario', evento.target.value)}
            />
          </label>
          <label className="busca-campo">
            <span>Cobertura</span>
            <select
              value={filtros.coberta}
              onChange={(evento) => atualizarCampo('coberta', evento.target.value)}
            >
              <option value="">Tanto faz</option>
              <option value="true">Coberta</option>
              <option value="false">Ao ar livre</option>
            </select>
          </label>
          <label className="busca-campo">
            <span>Preço mínimo</span>
            <input
              type="number"
              min="0"
              placeholder="R$ 0"
              value={filtros.precoMin}
              onChange={(evento) => atualizarCampo('precoMin', evento.target.value)}
            />
          </label>
          <label className="busca-campo">
            <span>Preço máximo</span>
            <input
              type="number"
              min="0"
              placeholder="Sem limite"
              value={filtros.precoMax}
              onChange={(evento) => atualizarCampo('precoMax', evento.target.value)}
            />
          </label>
        </div>
      )}
    </form>
  );
}

export default FiltroBusca;
