import { useState } from 'react';
import { PLANOS, resumoNegocio, TRANSACOES_DEMO } from './negocio';

const reais = (centavos) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataLocal = (data) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
const dataBr = (data) => data.split('-').reverse().join('/');
const SITUACOES = {
  paga: 'Pago · simulado',
  pendente: 'Pagamento pendente',
  cancelada: 'Cancelada',
  reembolsada: 'Reembolsada',
};

export default function PainelNegocio({ contas }) {
  const [hoje] = useState(() => dataLocal(new Date()));
  const [periodo, setPeriodo] = useState('mes');
  const inicio =
    periodo === 'hoje'
      ? hoje
      : periodo === 'mes'
        ? `${hoje.slice(0, 7)}-01`
        : dataLocal(
            new Date(
              Number(hoje.slice(0, 4)),
              Number(hoje.slice(5, 7)) - 1,
              Number(hoje.slice(8)) - 6
            )
          );
  const resumo = resumoNegocio(contas, TRANSACOES_DEMO, inicio, hoje);
  return (
    <section className="admin-business" aria-label="Visão do negócio">
      <div className="admin-business-heading">
        <div>
          <h2>Como o negócio está crescendo</h2>
          <p>Planos e destaques das contas ativas · posição atual.</p>
        </div>
        <span className="admin-demo-badge">Dados demonstrativos</span>
      </div>
      <div className="admin-plans">
        {Object.entries(PLANOS).map(([id, nome]) => (
          <div key={id}>
            <span>{nome}</span>
            <strong>{String(resumo.planos[id]).padStart(2, '0')}</strong>
            <small>{id === 'freemium' ? 'No plano gratuito' : 'No plano pago · simulado'}</small>
          </div>
        ))}
        <div className="admin-plan-highlight">
          <span>Patrocinados</span>
          <strong>{String(resumo.patrocinados).padStart(2, '0')}</strong>
          <small>Destaque contratado · independente do plano</small>
        </div>
      </div>
      <div className="admin-business-heading admin-finance-heading">
        <div>
          <h2>Reservas e nossa receita</h2>
          <p>
            {dataBr(inicio)} a {dataBr(hoje)} · apenas reservas feitas pela plataforma.
          </p>
        </div>
        <select
          aria-label="Período financeiro"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        >
          <option value="hoje">Hoje</option>
          <option value="semana">Últimos 7 dias</option>
          <option value="mes">Este mês</option>
        </select>
      </div>
      <div className="admin-finance">
        <div>
          <span>Transações válidas</span>
          <strong>{resumo.transacoes}</strong>
          <small>
            {resumo.pagas} pagas · {resumo.transacoes - resumo.pagas} pendentes
          </small>
        </div>
        <div>
          <span>Volume de reservas</span>
          <strong>{reais(resumo.volume)}</strong>
          <small>Valor bruto · não é nossa receita</small>
        </div>
        <div className="admin-revenue">
          <span>Nossa taxa prevista · 10%</span>
          <strong>{reais(resumo.taxaPrevista)}</strong>
          <small>Sobre reservas pagas e pendentes</small>
        </div>
      </div>
      <div className="admin-revenue-breakdown">
        <span>
          Taxa sobre pagamentos confirmados <strong>{reais(resumo.taxaPaga)}</strong>
        </span>
        <span>
          Taxa potencial · pagamento pendente <strong>{reais(resumo.taxaPendente)}</strong>
        </span>
      </div>
      <p className="admin-finance-note">
        Valores fictícios, sem recebimento ou repasse real. Canceladas e reembolsadas não geram
        comissão. Não inclui reservas manuais, mensalistas, assinaturas ou cobrança de patrocínio. A
        base financeira é independente da agenda do gestor.
      </p>
      <details className="admin-transactions">
        <summary>
          Ver transações do período <span>{resumo.periodo.length} registros</span>
        </summary>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reserva / data</th>
                <th>Estabelecimento</th>
                <th>Valor bruto</th>
                <th>Taxa de 10%</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {resumo.periodo.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.id}</strong>
                    <small>{dataBr(t.data)}</small>
                  </td>
                  <td>{t.estabelecimento}</td>
                  <td>{reais(t.valor)}</td>
                  <td>
                    {['paga', 'pendente'].includes(t.status)
                      ? reais(Math.round(t.valor * 0.1))
                      : '—'}
                  </td>
                  <td>{SITUACOES[t.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!resumo.periodo.length && (
          <p className="admin-empty">Nenhuma transação demonstrativa neste período.</p>
        )}
      </details>
    </section>
  );
}
