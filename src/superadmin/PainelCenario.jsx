import { useState } from 'react';
import {
  PLANOS_PROPOSTA,
  CONFIG_PROPOSTA,
  CENARIO_PROPOSTA,
  configurarProposta,
  contasDaProposta,
  reservasDaProposta,
  resumoProposta,
  valoresDaReserva,
} from './proposta';

const reais = (c) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataLocal = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dataBr = (d) => d.split('-').reverse().join('/');
const FONTE =
  'https://bibliotecas.sebrae.com.br/chronus/ARQUIVOS_CHRONUS/IDEIAS_DE_NEGOCIO/PDFS/ideia-de-negocio_locacao-de-quadra-de-esporte.pdf';

export default function PainelCenario({ contas, config, onConfigChange }) {
  const [hoje] = useState(() => dataLocal(new Date()));
  const [periodo, setPeriodo] = useState('mes');
  const [usarPlanosAtuais, setUsarPlanosAtuais] = useState(false);
  const [pagina, setPagina] = useState(1);
  const mes = hoje.slice(0, 7);
  const ultimoDia = dataLocal(new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0));
  const financeiro = configurarProposta(config);
  const h = financeiro.cenario;
  const salvar = (proposta) => onConfigChange({ ...config, proposta });
  const contasSimuladas = contasDaProposta(contas, h, usarPlanosAtuais);
  const transacoes = reservasDaProposta(contasSimuladas, mes, h);
  const mensal = resumoProposta(contasSimuladas, transacoes, `${mes}-01`, ultimoDia, financeiro);
  const gatewayMRR = Math.round((mensal.recorrenciaMensal * financeiro.gatewayMRR) / 100);
  const mrrLiquido = mensal.recorrenciaMensal - gatewayMRR;
  const receitaBruta = mensal.recorrenciaMensal + mensal.taxaPrevista;
  const receitaLiquida = mrrLiquido + mensal.liquidoPrevisto;
  const appTentadas = transacoes.filter((t) => t.canal === 'app').length;
  const inicio =
    periodo === 'hoje'
      ? hoje
      : periodo === 'semana'
        ? dataLocal(
            new Date(
              Number(hoje.slice(0, 4)),
              Number(hoje.slice(5, 7)) - 1,
              Number(hoje.slice(8)) - 6
            )
          )
        : `${mes}-01`;
  const fim = periodo === 'projecao' ? ultimoDia : hoje;
  const basePeriodo =
    inicio.slice(0, 7) !== mes
      ? [...reservasDaProposta(contasSimuladas, inicio.slice(0, 7), h), ...transacoes]
      : transacoes;
  const r = resumoProposta(contasSimuladas, basePeriodo, inicio, fim, financeiro);
  const padrao =
    !usarPlanosAtuais &&
    Object.keys(CENARIO_PROPOSTA).every((k) => h[k] === CENARIO_PROPOSTA[k]) &&
    Object.keys(CONFIG_PROPOSTA).every((k) => financeiro[k] === CONFIG_PROPOSTA[k]);
  const paginas = Math.max(1, Math.ceil(r.periodo.length / 20));
  const paginaAtual = Math.min(pagina, paginas);
  const linhas = r.periodo.slice((paginaAtual - 1) * 20, paginaAtual * 20);
  const temTaxa = (t) => t.canal === 'app' && ['paga', 'pendente'].includes(t.status);
  function alterarHipotese(chave, valor, min, max) {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < min || numero > max) return;
    salvar({ ...financeiro, cenario: { ...h, [chave]: numero } });
    setPagina(1);
  }
  return (
    <section className="admin-business" aria-label="Visão do negócio">
      <div className="admin-month-total">
        <span>
          PROJEÇÃO {padrao ? 'CONSERVADORA' : 'PERSONALIZADA'} · MÊS COMPLETO ·{' '}
          {mes.split('-').reverse().join('/')}
        </span>
        <strong>
          {reais(receitaLiquida)}
          <small> / mês</small>
        </strong>
        <div className="admin-month-equation">
          <span>
            MRR após gateway <b>{reais(mrrLiquido)}</b>
          </span>
          <span aria-hidden="true">+</span>
          <span>
            Taxas após gateway <b>{reais(mensal.liquidoPrevisto)}</b>
          </span>
          <span className="admin-projection-gross">
            Receita bruta <b>{reais(receitaBruta)}</b>
          </span>
        </div>
        <p>
          Projeção, não receita recebida nem lucro: descontamos gateway de reservas, planos e
          patrocínios. Não inclui impostos, infraestrutura, marketing, suporte ou outros custos.
          Reservas canceladas não geram receita.
        </p>
      </div>
      <p className="admin-finance-note admin-proposal-note">
        MODELO EM VALIDAÇÃO · Gestão Free completa, plano opcional de Crescimento e taxa nas
        reservas pelo app. Preços, adesão e custos de pagamento são hipóteses editáveis.
      </p>
      <div className="admin-business-heading">
        <div>
          <h2>O cenário por trás dos números</h2>
          <p>Hipóteses conservadoras editáveis — não uma média comprovada do mercado.</p>
        </div>
        <span className="admin-demo-badge">Simulação · não histórico real</span>
      </div>
      <div className="admin-scenario-summary">
        <div>
          <strong>{contasSimuladas.length}</strong>
          <span>quadras de referência</span>
          <small>1 por estabelecimento ativo, mesmo quando há várias</small>
        </div>
        <div>
          <strong>
            {h.reservasDia} × {h.diasAtivos}
          </strong>
          <span>reservas/dia × dias/mês</span>
          <small>
            {Math.round(h.reservasDia * Math.min(h.diasAtivos, Number(ultimoDia.slice(8))))}{' '}
            reservas de 1h por quadra/mês
          </small>
        </div>
        <div>
          <strong>
            {h.percentualApp}% / {100 - h.percentualApp}%
          </strong>
          <span>app / WhatsApp e presencial</span>
          <small>Reservas fora do app não geram comissão</small>
        </div>
        <div>
          <strong>{reais(h.ticket * 100)}</strong>
          <span>ticket médio por reserva</span>
          <small>{h.cancelamentos}% de cancelamentos; procura maior no fim de semana</small>
        </div>
      </div>
      <details className="admin-price-settings">
        <summary>Ajustar premissas e preços</summary>
        <div className="admin-settings-grid">
          {[
            ['reservasDia', 'Reservas por quadra/dia', 0, 10, 0.5],
            ['diasAtivos', 'Dias de operação/mês', 1, 31, 1],
            ['ticket', 'Ticket médio · R$', 1, 1000, 1],
            ['percentualApp', 'Reservas pelo app · %', 0, 100, 1],
            ['cancelamentos', 'Cancelamentos · %', 0, 100, 1],
            ['percentualPremium', 'Adesão Crescimento · %', 0, 100, 1],
            ['percentualPix', 'Pix nos pagamentos do app · %', 0, 100, 1],
            ['percentualPatrocinio', 'Adesão patrocínio · %', 0, 100, 1],
          ].map(([chave, label, min, max, step]) => (
            <label key={chave}>
              {label}
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={h[chave]}
                onChange={(e) => alterarHipotese(chave, e.target.value, min, max)}
              />
            </label>
          ))}
          {[
            ['crescimento', 'Crescimento · R$/mês'],
            ['patrocinio', 'Patrocínio · R$/mês'],
            ['taxaPix', 'Taxa da plataforma · Pix %', true],
            ['taxaCartao', 'Taxa da plataforma · cartão %', true],
            ['gatewayPix', 'Gateway Pix · R$/transação'],
            ['gatewayCartaoPercentual', 'Gateway cartão · %', true],
            ['gatewayCartaoFixo', 'Gateway cartão · R$/transação'],
            ['gatewayMRR', 'Gateway de planos/patrocínio · %', true],
          ].map(([chave, label, percentual]) => (
            <label key={chave}>
              {label}
              <input
                type="number"
                min="0"
                max={percentual ? 100 : 10000}
                step="0.01"
                value={percentual ? financeiro[chave] : financeiro[chave] / 100}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v) && v >= 0 && v <= (percentual ? 100 : 10000))
                    salvar({
                      ...financeiro,
                      [chave]: percentual ? v : Math.round(v * 100),
                    });
                }}
              />
            </label>
          ))}
        </div>
        <button
          className="admin-scenario-reset"
          onClick={() => salvar({ ...CONFIG_PROPOSTA, cenario: { ...CENARIO_PROPOSTA } })}
        >
          Restaurar hipóteses da proposta
        </button>
        <p className="admin-finance-note">
          Dias limitados à duração do mês. Reservas de 1h, sem dupla contagem de mensalistas; o
          canal externo inclui acordos diretos e não gera comissão. Taxa adicionada ao preço da
          quadra: {financeiro.taxaPix}% no Pix e {financeiro.taxaCartao}% no cartão. Gateway
          hipotético: {reais(financeiro.gatewayPix)} por Pix; no cartão,{' '}
          {financeiro.gatewayCartaoPercentual}% sobre o total do checkout +{' '}
          {reais(financeiro.gatewayCartaoFixo)}. Planos e patrocínios: {financeiro.gatewayMRR}%. Sem
          parcelamento, chargebacks ou custos de reembolso modelados.
        </p>
      </details>
      <div className="admin-business-heading">
        <div>
          <h2>Planos e receita recorrente</h2>
          <p>
            {usarPlanosAtuais
              ? 'Planos Free e Crescimento dos cadastros ativos — adesão demonstrativa, não conservadora.'
              : `Hipótese: ${h.percentualPremium}% em Crescimento, arredondados para baixo. Cadastros preservados.`}
          </p>
        </div>
        <select
          aria-label="Modelo de adesão aos planos"
          value={usarPlanosAtuais ? 'cadastros' : 'conservador'}
          onChange={(e) => setUsarPlanosAtuais(e.target.value === 'cadastros')}
        >
          <option value="conservador">Adesão conservadora</option>
          <option value="cadastros">Planos dos cadastros</option>
        </select>
      </div>
      <div className="admin-plans admin-proposal-plans">
        {Object.entries(PLANOS_PROPOSTA).map(([id, nome]) => (
          <div key={id}>
            <span>{nome}</span>
            <strong>
              {reais(mensal.receitaPlanos[id])}
              <small>/ mês</small>
            </strong>
            <small>
              {mensal.planos[id]} gestores × {reais(id === 'freemium' ? 0 : financeiro.crescimento)}
            </small>
            <small>
              {id === 'freemium'
                ? 'Agenda, mensalistas, reservas e financeiro básico'
                : 'Inteligência, campanhas e otimização de receita'}
            </small>
          </div>
        ))}
        <div className="admin-plan-highlight">
          <span>Patrocinados</span>
          <strong>
            {reais(mensal.receitaPatrocinio)}
            <small>/ mês</small>
          </strong>
          <small>
            {mensal.patrocinados} anunciantes × {reais(financeiro.patrocinio)} · separado do plano
          </small>
          <small>
            Proposta: até 2–3 destaques por busca, com rodízio e respeito aos filtros. Sem garantia
            de reservas.
          </small>
        </div>
      </div>
      <div className="admin-revenue-breakdown">
        <span>
          MRR bruto <strong>{reais(mensal.recorrenciaMensal)}</strong>
        </span>
        <span>
          Gateway do MRR <strong>− {reais(gatewayMRR)}</strong>
        </span>
        <span>
          MRR após gateway <strong>{reais(mrrLiquido)}</strong>
        </span>
      </div>
      <div className="admin-business-heading admin-finance-heading">
        <div>
          <h2>Movimento mensal estimado</h2>
          <p>
            {transacoes.length} reservas planejadas · {appTentadas} pelo app ·{' '}
            {transacoes.length - appTentadas} diretas ·{' '}
            {transacoes.filter((t) => t.status === 'cancelada').length} canceladas.
          </p>
        </div>
      </div>
      <div className="admin-finance">
        <div>
          <span>Volume de todos os canais</span>
          <strong>{reais(mensal.volumeTotal)}</strong>
          <small>{mensal.reservasTotais} reservas válidas · receita das quadras</small>
        </div>
        <div>
          <span>Volume pelo app</span>
          <strong>{reais(mensal.volume)}</strong>
          <small>{mensal.transacoes} válidas · só essa parte gera taxa</small>
        </div>
        <div>
          <span>WhatsApp / presencial</span>
          <strong>{mensal.reservasExternas}</strong>
          <small>Reservas válidas · comissão zero</small>
        </div>
      </div>
      <div className="admin-finance admin-net-finance">
        <div>
          <span>
            Taxas brutas · Pix {financeiro.taxaPix}% / cartão {financeiro.taxaCartao}%
          </span>
          <strong>{reais(mensal.taxaPrevista)}</strong>
          <small>Não confundir com o volume das quadras</small>
        </div>
        <div>
          <span>Gateway das reservas</span>
          <strong>− {reais(mensal.gatewayPrevisto)}</strong>
          <small>Inclui a taxa cobrada do jogador</small>
        </div>
        <div className="admin-revenue">
          <span>Taxas após gateway</span>
          <strong>{reais(mensal.liquidoPrevisto)}</strong>
          <small>Somadas ao MRR no total mensal</small>
        </div>
      </div>
      <div className="admin-finance admin-payment-breakdown">
        {Object.entries(mensal.porPagamento).map(([meio, valores]) => (
          <div key={meio}>
            <span>
              {meio === 'pix' ? 'Pix' : 'Cartão'} · {valores.reservas} reservas válidas
            </span>
            <strong>{reais(valores.liquido)}</strong>
            <small>
              Após gateway · taxas brutas {reais(valores.taxa)} − gateway {reais(valores.gateway)}
            </small>
          </div>
        ))}
      </div>
      <div className="admin-business-heading admin-finance-heading">
        <div>
          <h2>Reservas simuladas</h2>
          <p>
            {dataBr(inicio)} a {dataBr(fim)} · filtros até hoje não incluem datas futuras da
            projeção.
          </p>
        </div>
        <select
          aria-label="Período financeiro"
          value={periodo}
          onChange={(e) => {
            setPeriodo(e.target.value);
            setPagina(1);
          }}
        >
          <option value="hoje">Hoje</option>
          <option value="semana">Últimos 7 dias</option>
          <option value="mes">Mês até hoje</option>
          <option value="projecao">Projeção do mês inteiro</option>
        </select>
      </div>
      <div className="admin-revenue-breakdown">
        <span>
          {r.reservasTotais} válidas · {r.transacoes} app · {r.reservasExternas} diretas
        </span>
        <span>
          Taxas após gateway no período <strong>{reais(r.liquidoPrevisto)}</strong>
        </span>
      </div>
      <details className="admin-transactions">
        <summary>
          Ver reservas do período <span>{r.periodo.length} registros</span>
        </summary>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reserva / data</th>
                <th>Estabelecimento / horário</th>
                <th>Canal / pagamento</th>
                <th>Valor da quadra</th>
                <th>Taxa da plataforma</th>
                <th>Gateway</th>
                <th>Nossa receita</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.id}</strong>
                    <small>{dataBr(t.data)}</small>
                  </td>
                  <td>
                    {t.estabelecimento}
                    <small>{t.horario} · 1h</small>
                  </td>
                  <td>
                    {t.canal === 'app' ? 'QuadraFácil' : 'WhatsApp / presencial'}
                    <small>
                      {t.pagamento === 'pix'
                        ? 'Pix'
                        : t.pagamento === 'cartao'
                          ? 'Cartão'
                          : 'Pagamento externo · sem comissão'}
                    </small>
                  </td>
                  <td>{reais(t.valor)}</td>
                  <td>{temTaxa(t) ? reais(valoresDaReserva(t, financeiro).taxa) : '—'}</td>
                  <td>{temTaxa(t) ? reais(valoresDaReserva(t, financeiro).gateway) : '—'}</td>
                  <td>{reais(valoresDaReserva(t, financeiro).liquido)}</td>
                  <td>
                    {t.status === 'cancelada' ? 'Cancelada · simulada' : 'Liquidada · hipótese'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          <button disabled={paginaAtual <= 1} onClick={() => setPagina(paginaAtual - 1)}>
            Anterior
          </button>
          <span>
            Página {paginaAtual} de {paginas}
          </span>
          <button disabled={paginaAtual >= paginas} onClick={() => setPagina(paginaAtual + 1)}>
            Próxima
          </button>
        </div>
        {!r.periodo.length && (
          <p className="admin-empty">Nenhum registro simulado neste período.</p>
        )}
      </details>
      <p className="admin-finance-note">
        Referência de método:{' '}
        <a href={FONTE} target="_blank" rel="noreferrer">
          Sebrae · Locação de quadra de esporte
        </a>
        . O material recomenda pesquisa local e não valida estas médias. Taxas variam por provedor;
        os custos configurados são hipóteses, não cotações. Valores precisam de entrevistas e
        validação. Esta base não altera a agenda nem os cadastros da demonstração.
      </p>
    </section>
  );
}
