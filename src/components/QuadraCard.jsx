import { Link } from 'react-router-dom';
import Card from './common/Card';
import { formatarPreco } from '../utils/formatadores';

/**
 * Cartão de resumo de uma quadra, usado na listagem de busca.
 * @param {object} props
 * @param {object} props.quadra
 */
function QuadraCard({ quadra }) {
  const fotoPrincipal = quadra.fotos?.[0];

  return (
    <Card className="quadra-card">
      <Link to={`/user/quadras/${quadra.id}`} className="quadra-card-link">
        {fotoPrincipal && <img src={fotoPrincipal} alt={`Foto da quadra ${quadra.nome}`} />}
        <div className="quadra-card-corpo">
          <h3>{quadra.nome}</h3>
          <p className="quadra-card-local">
            {quadra.bairro ? `${quadra.bairro}, ` : ''}
            {quadra.cidade}
          </p>
          <span className="etiqueta-esporte">{quadra.esporte}</span>
          <p className="quadra-card-preco">
            {formatarPreco(quadra.precoHora)} <small>/hora</small>
          </p>
        </div>
      </Link>
    </Card>
  );
}

export default QuadraCard;
