import { Link } from 'react-router-dom';
import Card from './common/Card';

/**
 * Cartão de resumo de uma quadra, usado na listagem de busca.
 * @param {object} props
 * @param {object} props.quadra
 */
function QuadraCard({ quadra }) {
  const fotoPrincipal = quadra.fotos?.[0];

  return (
    <Card className="quadra-card">
      <Link to={`/quadras/${quadra.id}`} className="quadra-card-link">
        {fotoPrincipal && <img src={fotoPrincipal} alt={`Foto da quadra ${quadra.nome}`} />}
        <div className="quadra-card-corpo">
          <h3>{quadra.nome}</h3>
          <p className="quadra-card-local">
            {quadra.bairro ? `${quadra.bairro}, ` : ''}
            {quadra.cidade}
          </p>
          <span className="etiqueta-esporte">{quadra.esporte}</span>
          <p className="quadra-card-preco">
            R$ {quadra.precoHora.toFixed(2)} <small>/hora</small>
          </p>
        </div>
      </Link>
    </Card>
  );
}

export default QuadraCard;
