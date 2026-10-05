import { formatarTelefone } from '../utils/reserva';

/**
 * Campo de telefone com DDD que aplica a máscara (41) 99999-0000 enquanto
 * a pessoa digita.
 * @param {object} props
 * @param {string} props.value
 * @param {(telefone: string) => void} props.onChange
 */
function CampoTelefone({ value, onChange }) {
  return (
    <label className="campo-formulario">
      Telefone com DDD
      <input
        type="tel"
        required
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="(41) 99999-9999"
        value={value}
        onChange={(evento) => onChange(formatarTelefone(evento.target.value))}
      />
    </label>
  );
}

export default CampoTelefone;
