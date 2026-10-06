import { Link } from 'react-router-dom';
import Icon from './common/Icon';
import { formatarData, formatarPreco } from '../utils/formatadores';
import { fotoDaQuadra, quadraPatrocinada, rotuloDoEsporte } from '../utils/apresentacaoQuadras';
import { precosPorModalidade } from '../utils/estabelecimentos';

/**
 * Cartão de resumo de uma quadra, usado na listagem de busca.
 * @param {object} props
 * @param {object} props.quadra
 */
function QuadraCard({
  quadra,
  data = '',
  horarios = [],
  horarioBuscado = '',
  filtros = { esporte: 'society' },
}) {
  const fotoPrincipal = fotoDaQuadra(quadra);
  const parametros = new URLSearchParams(
    Object.entries(filtros).filter(([campo, valor]) => campo === 'esporte' || valor)
  );
  if (data) parametros.set('data', data);
  if (horarioBuscado) parametros.set('horario', horarioBuscado);
  const detalhes = `/user/quadras/${quadra.id}${parametros.size ? `?${parametros}` : ''}`;
  const espacos = quadra.quadras || [quadra];
  const precos = precosPorModalidade(espacos);
  const promocionais = espacos.filter((q) => q.promocao);
  const proximosHorarios = horarios
    .filter((h) => !horarioBuscado || h >= horarioBuscado)
    .slice(0, 3);

  return (
    <article className="quadra-card">
      <div className="quadra-card-midia">
        <Link to={detalhes} aria-label={`Ver detalhes de ${quadra.nome}`}>
          <img src={fotoPrincipal} alt={`Quadra ${quadra.nome}`} loading="lazy" />
        </Link>
        {espacos.some(quadraPatrocinada) && <span className="selo-patrocinado">Patrocinado</span>}
      </div>
      <div className="quadra-card-corpo">
        <span className="quadra-card-modalidade">
          {precos.map((p) => rotuloDoEsporte(p.esporte)).join(' · ')}
        </span>
        {promocionais.length > 0 && (
          <span className="quadra-promocao">
            {promocionais[0].rotuloPromocao || 'Preço promocional'} ·{' '}
            {promocionais.map((q) => q.nome).join(', ')} ·{' '}
            {horarioBuscado || 'horários selecionados'}
          </span>
        )}
        <h3>
          <Link to={detalhes}>{quadra.nome}</Link>
        </h3>
        <p className="quadra-card-local">
          <Icon name="local" size={16} />
          {quadra.bairro}, {quadra.cidade}
        </p>
        <p className="quadra-card-cobertura">
          {espacos.length} {espacos.length === 1 ? 'quadra compatível' : 'quadras compatíveis'} ·{' '}
          {espacos.every((q) => q.estrutura?.coberta)
            ? 'Coberta'
            : espacos.every((q) => !q.estrutura?.coberta)
              ? 'Ao ar livre'
              : 'Cobertas e ao ar livre'}
        </p>

        {data && (
          <div className="quadra-card-agenda">
            <span>Horários em {formatarData(data)}</span>
            {proximosHorarios.length > 0 ? (
              <div className="quadra-card-horarios">
                {proximosHorarios.map((horario) => (
                  <Link
                    key={horario}
                    to={`/user/quadras/${quadra.id}?${new URLSearchParams({ ...Object.fromEntries(parametros), horario })}`}
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
          <div className="precos-modalidades">
            {precos.map((p) => (
              <p key={p.esporte}>
                <small>
                  {rotuloDoEsporte(p.esporte)} ·{' '}
                  {!horarioBuscado || p.min !== p.max ? 'a partir de ' : ''}
                </small>
                <strong>{formatarPreco(p.min)}</strong>
                <span> / hora</span>
              </p>
            ))}
          </div>
          <Link to={detalhes} aria-label={`Ver horários de ${quadra.nome}`}>
            <Icon name="seta" size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default QuadraCard;
