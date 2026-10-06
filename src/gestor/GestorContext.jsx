import { useEffect, useState } from 'react';
import { GestorContexto as Contexto } from './context';
import { dadosIniciais, lerGestor, salvarGestor } from './model';
import { listarReservas } from '../services/reservaService';

export function GestorProvider({ children }) {
  const [dados, setDados] = useState(() => lerGestor() || dadosIniciais());
  const [externas, setExternas] = useState([]);
  useEffect(() => {
    if (!lerGestor()) salvarGestor(dados);
    const sincronizar = () =>
      setDados((anteriores) => {
        const atual = lerGestor();
        return atual && JSON.stringify(atual) !== JSON.stringify(anteriores) ? atual : anteriores;
      });
    window.addEventListener('quadrafacil-gestor', sincronizar);
    window.addEventListener('storage', sincronizar);
    return () => {
      window.removeEventListener('quadrafacil-gestor', sincronizar);
      window.removeEventListener('storage', sincronizar);
    };
  }, [dados]);
  useEffect(() => {
    const precosOriginais = dadosIniciais().quadras;
    const carregar = () =>
      listarReservas()
        .then((reservas) =>
          setExternas(
            reservas.map((r) => ({
              id: `api-${r.id}`,
              apiId: r.id,
              quadraId: r.quadraId,
              data: r.data,
              inicio: r.horario,
              fim: `${String(Number(r.horario.slice(0, 2)) + 1).padStart(2, '0')}:00`,
              tipo: 'avulsa',
              cliente: r.nomeCliente,
              telefone: r.telefoneCliente,
              origem: 'QuadraFácil',
              metodo: r.metodoPagamento || 'online',
              pagamento: r.status === 'confirmada' ? 'pago' : 'pendente',
              status: r.status,
              valor:
                r.valorTotal ??
                r.valor ??
                precosOriginais.find((q) => String(q.id) === String(r.quadraId))?.precoHora ??
                0,
            }))
          )
        )
        .catch(() => {});
    carregar();
    window.addEventListener('focus', carregar);
    return () => window.removeEventListener('focus', carregar);
  }, []);
  const atualizar = (fn) => {
    const proximo = fn(lerGestor() || dados);
    salvarGestor(proximo);
    setDados(proximo);
  };
  return (
    <Contexto.Provider value={{ dados, atualizar, externas, setExternas }}>
      {children}
    </Contexto.Provider>
  );
}
