import { Link } from 'react-router-dom';
import Icon from './common/Icon';
import { formatarData, formatarPreco } from '../utils/formatadores';
import { fotoDaQuadra, quadraPatrocinada, rotuloDoEsporte } from '../utils/apresentacaoQuadras';

/**
 * Cartão de resumo de uma quadra, usado na listagem de busca.
 * @param {object} props
 * @param {object} props.quadra
 */
function QuadraCard({ quadra, data = '', horarios = [], horarioBuscado = '' }) {
  const fotoPrincipal = fotoDaQuadra(quadra);
  const parametros = new URLSearchParams();
  if (data) parametros.set('data', data);
  if (horarioBuscado) parametros.set('horario', horarioBuscado);
  const detalhes = `/user/quadras/${quadra.id}${parametros.size ? `?${parametros}` : ''}`;
  const proximosHorarios = horarios.slice(0, 3);

  return (
    <article className="quadra-card">
      <div className="quadra-card-midia">
        <Link to={detalhes} aria-label={`Ver detalhes de ${quadra.nome}`}>
          <img src={fotoPrincipal} alt={`Quadra ${quadra.nome}`} loading="lazy" />
        </Link>
        {quadraPatrocinada(quadra) && <span className="selo-patrocinado">Patrocinado</span>}
      </div>
      <div className="quadra-card-corpo">
        <span className="quadra-card-modalidade">{rotuloDoEsporte(quadra.esporte)}</span>
        <h3>
          <Link to={detalhes}>{quadra.nome}</Link>
        </h3>
        <p className="quadra-card-local">
          <Icon name="local" size={16} />
          {quadra.bairro}, {quadra.cidade}
        </p>
        <p className="quadra-card-cobertura">
          {quadra.estrutura?.coberta ? 'Quadra coberta' : 'Ao ar livre'}
          {quadra.estrutura?.vestiario ? ' · Vestiário' : ''}
        </p>

        {data && (
          <div className="quadra-card-agenda">
            <span>Horários em {formatarData(data)}</span>
            {proximosHorarios.length > 0 ? (
              <div className="quadra-card-horarios">
                {proximosHorarios.map((horario) => (
                  <Link
                    key={horario}
                    to={`/user/quadras/${quadra.id}?data=${data}&horario=${horario}`}
                  >
                    {horario}
                  </Link>
                ))}
              </div>
            ) : (
              <p>Confira a agenda completa</p>
            )}
          </div>
        )}

        <div className="quadra-card-rodape">
          <p>
            <strong>{formatarPreco(quadra.precoHora)}</strong>
            <span> / hora</span>
          </p>
          <Link to={detalhes} aria-label={`Ver horários de ${quadra.nome}`}>
            <Icon name="seta" size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default QuadraCard;
