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

export default function PainelNegocio({ contas, config, onConfigChange }) {
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
  const resumo = resumoNegocio(contas, TRANSACOES_DEMO, inicio, hoje, config);
  return (
    <section className="admin-business" aria-label="Visão do negócio">
      <div className="admin-business-heading">
        <div>
          <h2>Planos e receita recorrente</h2>
          <p>Contratos ativos · projeção mensal bruta, não dinheiro recebido.</p>
        </div>
        <span className="admin-demo-badge">Dados demonstrativos</span>
      </div>
      <div className="admin-plans">
        {Object.entries(PLANOS).map(([id, nome]) => (
          <div key={id}>
            <span>{nome}</span>
            <strong>
              {reais(resumo.receitaPlanos[id])}
              <small>/ mês</small>
            </strong>
            <small>
              {resumo.planos[id]} gestores × {reais(id === 'freemium' ? 0 : config[id])}/mês
            </small>
          </div>
        ))}
        <div className="admin-plan-highlight">
          <span>Patrocinados</span>
          <strong>
            {reais(resumo.receitaPatrocinio)}
            <small>/ mês</small>
          </strong>
          <small>
            {resumo.patrocinados} destaques × {reais(config.patrocinio)}/mês · separados do plano
          </small>
        </div>
      </div>
      <div className="admin-revenue-breakdown">
        <span>
          Recorrência mensal total <strong>{reais(resumo.recorrenciaMensal)}</strong>
        </span>
        <span>Planos + patrocínios · antes de taxas de cobrança</span>
      </div>
      <details className="admin-price-settings">
        <summary>Valores demonstrativos e taxa do gateway</summary>
        <div className="admin-settings-grid">
          {[
            ['pro', 'Pro · R$/mês'],
            ['premium', 'Premium · R$/mês'],
            ['patrocinio', 'Patrocínio · R$/mês'],
            ['gatewayPercentual', 'Gateway · % sobre a reserva'],
          ].map(([chave, label]) => (
            <label key={chave}>
              {label}
              <input
                type="number"
                min="0"
                max={chave === 'gatewayPercentual' ? 100 : 10000}
                step="0.01"
                value={chave === 'gatewayPercentual' ? config[chave] : config[chave] / 100}
                onChange={(e) => {
                  const valor = Number(e.target.value);
                  if (
                    !Number.isFinite(valor) ||
                    valor < 0 ||
                    valor > (chave === 'gatewayPercentual' ? 100 : 10000)
                  )
                    return;
                  onConfigChange({
                    ...config,
                    [chave]: chave === 'gatewayPercentual' ? valor : Math.round(valor * 100),
                  });
                }}
              />
            </label>
          ))}
        </div>
        <p className="admin-finance-note">
          Hipóteses editáveis, não preços ou taxas reais. O gateway incide no valor total de cada
          reserva e é descontado da nossa comissão de 10%, não dos 10% apenas. Custos fixos por
          transação não estão simulados.
        </p>
      </details>
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
          <span>Comissão bruta prevista · 10%</span>
          <strong>{reais(resumo.taxaPrevista)}</strong>
          <small>Sobre reservas pagas e pendentes</small>
        </div>
      </div>
      <div className="admin-finance admin-net-finance">
        <div>
          <span>Gateway estimado · {config.gatewayPercentual}%</span>
          <strong>− {reais(resumo.gatewayPrevisto)}</strong>
          <small>Sobre o valor total das reservas válidas</small>
        </div>
        <div className="admin-revenue">
          <span>Ganho líquido previsto</span>
          <strong>{reais(resumo.liquidoPrevisto)}</strong>
          <small>Comissão bruta − gateway · não é lucro final</small>
        </div>
        <div>
          <span>Líquido · pagamentos confirmados</span>
          <strong>{reais(resumo.liquidoPago)}</strong>
          <small>Ainda não representa repasse recebido</small>
        </div>
      </div>
      <div className="admin-revenue-breakdown">
        <span>
          Comissão bruta · pagamentos confirmados <strong>{reais(resumo.taxaPaga)}</strong>
        </span>
        <span>
          Taxa potencial · pagamento pendente <strong>{reais(resumo.taxaPendente)}</strong>
        </span>
      </div>
      <p className="admin-finance-note">
        Valores fictícios, sem recebimento ou repasse real. Canceladas e reembolsadas não geram
        comissão. A comissão não inclui reservas manuais nem mensalistas. A base financeira é
        independente da agenda do gestor. A recorrência mensal é uma projeção separada e não é
        somada às reservas do período. Não simulamos tributos, outros custos ou taxas de cobrança
        dos planos e patrocínios.
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
                <th>Gateway</th>
                <th>Líquido</th>
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
                  <td>
                    {['paga', 'pendente'].includes(t.status)
                      ? reais(Math.round((t.valor * config.gatewayPercentual) / 100))
                      : '—'}
                  </td>
                  <td>
                    {['paga', 'pendente'].includes(t.status)
                      ? reais(
                          Math.round(t.valor * 0.1) -
                            Math.round((t.valor * config.gatewayPercentual) / 100)
                        )
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
