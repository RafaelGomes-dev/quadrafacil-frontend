import { useState } from 'react';
import Button from './common/Button';

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
  cidade: '',
  bairro: '',
  esporte: '',
  precoMin: '',
  precoMax: '',
  data: '',
  horario: '',
};

/**
 * Formulário de busca de quadras. Permite restringir quais campos aparecem
 * via `camposVisiveis`, para reutilização tanto no hero da Home (versão
 * compacta) quanto na página de listagem (versão completa).
 * @param {object} props
 * @param {string[]} [props.camposVisiveis]
 * @param {object} [props.valoresIniciais]
 * @param {(filtros: object) => void} props.onBuscar
 */
function FiltroBusca({
  camposVisiveis = Object.keys(FILTROS_PADRAO),
  valoresIniciais = {},
  onBuscar,
}) {
  const [filtros, setFiltros] = useState({ ...FILTROS_PADRAO, ...valoresIniciais });

  function atualizarCampo(nomeDoCampo, valor) {
    setFiltros((filtrosAtuais) => ({ ...filtrosAtuais, [nomeDoCampo]: valor }));
  }

  function lidarComEnvio(evento) {
    evento.preventDefault();
    onBuscar(filtros);
  }

  return (
    <form className="filtro-busca" onSubmit={lidarComEnvio}>
      {camposVisiveis.includes('cidade') && (
        <label className="campo-formulario">
          Cidade
          <input
            type="text"
            value={filtros.cidade}
            placeholder="Ex: Curitiba"
            onChange={(evento) => atualizarCampo('cidade', evento.target.value)}
          />
        </label>
      )}

      {camposVisiveis.includes('bairro') && (
        <label className="campo-formulario">
          Bairro
          <input
            type="text"
            value={filtros.bairro}
            placeholder="Ex: Batel"
            onChange={(evento) => atualizarCampo('bairro', evento.target.value)}
          />
        </label>
      )}

      {camposVisiveis.includes('esporte') && (
        <label className="campo-formulario">
          Esporte
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
        </label>
      )}

      {camposVisiveis.includes('data') && (
        <label className="campo-formulario">
          Data
          <input
            type="date"
            value={filtros.data}
            onChange={(evento) => atualizarCampo('data', evento.target.value)}
          />
        </label>
      )}

      {camposVisiveis.includes('horario') && (
        <label className="campo-formulario">
          Horário
          <input
            type="time"
            value={filtros.horario}
            onChange={(evento) => atualizarCampo('horario', evento.target.value)}
          />
        </label>
      )}

      {camposVisiveis.includes('precoMin') && (
        <label className="campo-formulario">
          Preço mínimo
          <input
            type="number"
            min="0"
            value={filtros.precoMin}
            onChange={(evento) => atualizarCampo('precoMin', evento.target.value)}
          />
        </label>
      )}

      {camposVisiveis.includes('precoMax') && (
        <label className="campo-formulario">
          Preço máximo
          <input
            type="number"
            min="0"
            value={filtros.precoMax}
            onChange={(evento) => atualizarCampo('precoMax', evento.target.value)}
          />
        </label>
      )}

      <Button type="submit">Buscar quadras</Button>
    </form>
  );
}

export default FiltroBusca;
