import { useState } from 'react';
import { useGestor } from './context';
import { hoje, somarDias } from './model';
import { lancamentosDemo, resumoFinanceiro, reaisCentavos } from './relatorios';
import { formatarData } from '../utils/formatadores';
import Icon from '../components/common/Icon';
import Drawer from './Drawer';
import { Metric } from './Inteligencia';

const STATUS = {
  paga: 'Pago',
  pendente: 'Pendente',
  cancelada: 'Cancelada',
  reembolsada: 'Reembolsada',
};
export default function Financeiro() {
  const { dados } = useGestor();
  const [referencia] = useState(hoje);
  const [periodo, setPeriodo] = useState('mes');
  const [quadra, setQuadra] = useState('todas');
  const [origem, setOrigem] = useState('todas');
  const [situacao, setSituacao] = useState('todas');
  const [detalhe, setDetalhe] = useState(null);
  const de =
    periodo === 'hoje'
      ? referencia
      : periodo === 'semana'
        ? somarDias(referencia, -6)
        : `${referencia.slice(0, 7)}-01`;
  const lancamentos = lancamentosDemo(dados, referencia).filter(
    (l) =>
      l.data >= de &&
      l.data <= referencia &&
      (quadra === 'todas' || String(l.quadraId) === quadra) &&
      (origem === 'todas' || l.origem === origem) &&
      (situacao === 'todas' || l.status === situacao)
  );
  const r = resumoFinanceiro(lancamentos);
  const datas = [...new Set(lancamentos.map((l) => l.data))].sort();
  const serie = datas.map((data) => ({
    data,
    valor: resumoFinanceiro(lancamentos.filter((l) => l.data === data)).liquido,
  }));
  const maior = Math.max(1, ...serie.map((d) => d.valor));
  const taxaDetalhe = detalhe ? r.taxa(detalhe) : 0;
  return (
    <>
      <div className="g-page-heading">
        <div>
          <span className="g-eyebrow">FINANCEIRO · SEU ESTABELECIMENTO</span>
          <h1>Mais clareza para o seu caixa.</h1>
          <p>Reservas, mensalidades e repasses. Cada valor no seu lugar.</p>
        </div>
        <span className="r-premium-tag">
          <Icon name="dinheiro" size={17} /> Operação simulada
        </span>
      </div>
      <div className="r-demo-notice">
        <Icon name="escudo" size={18} />
        <span>
          Extrato fictício, independente da agenda e dos pagamentos reais. Nenhuma movimentação
          bancária, fiscal ou cobrança será realizada.
        </span>
      </div>
      <div className="r-filters">
        <label>
          Período
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="mes">Este mês</option>
            <option value="semana">Últimos 7 dias</option>
            <option value="hoje">Hoje</option>
          </select>
        </label>
        {dados.quadras.length > 1 && (
          <label>
            Quadra
            <select value={quadra} onChange={(e) => setQuadra(e.target.value)}>
              <option value="todas">Todas as quadras</option>
              {dados.quadras.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.nome}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Origem
          <select value={origem} onChange={(e) => setOrigem(e.target.value)}>
            <option value="todas">Todas as origens</option>
            <option value="QuadraFácil">Pela plataforma</option>
            <option value="Presencial">Direto / presencial</option>
          </select>
        </label>
        <label>
          Situação
          <select value={situacao} onChange={(e) => setSituacao(e.target.value)}>
            <option value="todas">Todas as situações</option>
            {Object.entries(STATUS).map(([id, nome]) => (
              <option key={id} value={id}>
                {nome}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="r-finance-hero">
        <div>
          <span>
            LÍQUIDO PREVISTO · {formatarData(de)} A {formatarData(referencia)}
          </span>
          <strong>{reaisCentavos(r.liquido)}</strong>
          <p>
            Reservas e mensalidades válidas, após a comissão da plataforma. Inclui pagamentos
            pendentes.
          </p>
        </div>
        <div className="r-finance-equation">
          <span>
            Receita bruta <b>{reaisCentavos(r.bruto)}</b>
          </span>
          <span>
            Comissão QuadraFácil <b>− {reaisCentavos(r.taxas)}</b>
          </span>
        </div>
      </div>
      <div className="r-metrics">
        <Metric
          label="Recebido / repassado"
          value={reaisCentavos(r.recebido)}
          note="Pagamentos diretos + repasses já simulados"
        />
        <Metric
          label="A receber dos clientes"
          value={reaisCentavos(r.pendente)}
          note="Valor líquido dos pagamentos pendentes"
        />
        <Metric
          label="Repasse previsto"
          value={reaisCentavos(r.repassePendente)}
          note="Reservas online pagas, ainda não repassadas"
        />
      </div>
      <div className="r-two-columns">
        <section className="r-card">
          <div className="r-card-title">
            <div>
              <h2>Receita ao longo do período</h2>
              <p>Valor líquido previsto por dia, com os filtros selecionados.</p>
            </div>
          </div>
          {serie.length ? (
            <div className="r-chart-scroll">
              <div
                className="r-bar-chart"
                role="img"
                aria-label="Gráfico de receita líquida por dia"
              >
                <div className="r-chart-top">Máximo: {reaisCentavos(maior)}</div>
                <div className="r-chart-bars">
                  {serie.map((d) => (
                    <div className="r-chart-column" key={d.data}>
                      <div className="r-bar-track">
                        <div
                          className="r-bar"
                          style={{ height: `${(d.valor / maior) * 100}%` }}
                          title={`${formatarData(d.data)}: ${reaisCentavos(d.valor)}`}
                        />
                      </div>
                      <span>
                        {d.data.slice(8)}/{d.data.slice(5, 7)}
                      </span>
                      <small>{reaisCentavos(d.valor)}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="r-empty">Sem receita demonstrativa neste filtro.</p>
          )}
        </section>
        <section className="r-card">
          <div className="r-card-title">
            <div>
              <h2>De onde vem a receita</h2>
              <p>Valores brutos válidos. Mensalidades entram uma vez por mês.</p>
            </div>
          </div>
          <div className="r-source-list">
            <Source label="Reservas pela plataforma" value={r.online} total={r.bruto} />
            <Source label="Direto / presencial" value={r.direto} total={r.bruto} />
          </div>
          <div className="r-learning">
            <Icon name="pessoas" />
            <p>
              <strong>{reaisCentavos(r.mensalidades)} em mensalidades.</strong> Já incluídas nos
              valores diretos acima; não somamos novamente cada ocorrência na agenda.
            </p>
          </div>
        </section>
      </div>
      <section className="r-card">
        <div className="r-card-title">
          <div>
            <h2>Extrato detalhado</h2>
            <p>{lancamentos.length} lançamentos · clique em um item para conferir.</p>
          </div>
          <span className="r-premium-tag">Dados fictícios</span>
        </div>
        <div className="r-table-scroll">
          <table className="r-table">
            <thead>
              <tr>
                <th>Cliente / data</th>
                <th>Quadra / origem</th>
                <th>Bruto</th>
                <th>Taxa</th>
                <th>Líquido previsto</th>
                <th>Pagamento</th>
                <th>Repasse</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => {
                const valido = ['paga', 'pendente'].includes(l.status);
                return (
                  <tr key={l.id}>
                    <td>
                      <button className="r-row-link" onClick={() => setDetalhe(l)}>
                        {l.cliente}
                      </button>
                      <small>
                        {formatarData(l.data)} · {l.id}
                      </small>
                    </td>
                    <td>
                      {l.quadra}
                      <small>{l.tipo === 'mensalidade' ? 'Mensalidade · direto' : l.origem}</small>
                    </td>
                    <td>{reaisCentavos(l.valor)}</td>
                    <td>{valido ? reaisCentavos(r.taxa(l)) : '—'}</td>
                    <td>{valido ? reaisCentavos(l.valor - r.taxa(l)) : '—'}</td>
                    <td>
                      <span className={`r-status ${l.status}`}>{STATUS[l.status]}</span>
                      <small>{l.metodo}</small>
                    </td>
                    <td>
                      {!valido || l.status === 'pendente'
                        ? '—'
                        : l.origem !== 'QuadraFácil'
                          ? 'Recebido direto'
                          : l.repasse === 'repassado'
                            ? 'Repassado'
                            : 'Previsto'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!lancamentos.length && (
          <p className="r-empty">Nenhum lançamento com estes filtros. Tente outra combinação.</p>
        )}
      </section>
      <p className="r-footnote">
        Hipótese do protótipo: comissão de 10% somente sobre reservas avulsas pela plataforma;
        gateway já coberto por essa comissão, sem desconto duplicado no gestor. Diretos e
        mensalidades não têm comissão nesta simulação. Canceladas e reembolsadas são excluídas dos
        totais. Assinatura do plano, tributos e outros custos operacionais não são descontados:
        líquido não significa lucro.
      </p>
      {detalhe && (
        <Drawer
          titulo="Detalhe do lançamento"
          subtitulo={`${detalhe.id} · demonstração`}
          onClose={() => setDetalhe(null)}
        >
          <div className="r-transaction-detail">
            <span className={`r-status ${detalhe.status}`}>{STATUS[detalhe.status]}</span>
            <h3>{detalhe.cliente}</h3>
            <p>
              {detalhe.quadra} · {formatarData(detalhe.data)}
            </p>
            <dl>
              <dt>Origem</dt>
              <dd>{detalhe.origem}</dd>
              <dt>Tipo</dt>
              <dd>{detalhe.tipo === 'mensalidade' ? 'Mensalidade' : 'Reserva avulsa'}</dd>
              <dt>Forma de pagamento</dt>
              <dd>{detalhe.metodo}</dd>
              <dt>Valor bruto</dt>
              <dd>{reaisCentavos(detalhe.valor)}</dd>
              <dt>Comissão estimada</dt>
              <dd>
                {['paga', 'pendente'].includes(detalhe.status)
                  ? reaisCentavos(taxaDetalhe)
                  : 'Não aplicável'}
              </dd>
              <dt>Líquido previsto</dt>
              <dd>
                {['paga', 'pendente'].includes(detalhe.status)
                  ? reaisCentavos(detalhe.valor - taxaDetalhe)
                  : 'Excluído dos totais'}
              </dd>
            </dl>
            <div className="r-demo-notice">
              Registro fictício. Não há comprovante, nota fiscal ou repasse real.
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}
function Source({ label, value, total }) {
  return (
    <div>
      <span>
        {label}
        <b>{reaisCentavos(value)}</b>
      </span>
      <div className="r-progress">
        <i style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
