import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGestor } from './context';
import { contaDemo } from '../superadmin/model';
import { PLANOS } from '../superadmin/negocio';
import { hoje, somarDias, horaNumero } from './model';
import { DIAS_CURTOS, mapaOcupacao, precoSugerido } from './relatorios';
import { formatarData, formatarPreco } from '../utils/formatadores';
import Icon from '../components/common/Icon';
import Drawer from './Drawer';

export default function Inteligencia() {
  const { dados } = useGestor();
  const conta = contaDemo();
  const paga = ['pro', 'premium'].includes(conta?.plano);
  const [referencia] = useState(hoje);
  const [semanas, setSemanas] = useState(4);
  const [quadra, setQuadra] = useState('todas');
  const [selecionada, setSelecionada] = useState(null);
  const [sugestao, setSugestao] = useState(null);
  const quadras = dados.quadras.filter(
    (q) => q.ativa !== false && (quadra === 'todas' || String(q.id) === quadra)
  );
  const mapa = mapaOcupacao(quadras, semanas);
  if (!paga)
    return (
      <>
        <div className="g-page-heading">
          <div>
            <span className="g-eyebrow">INTELIGÊNCIA · PLANOS PAGOS</span>
            <h1>O próximo passo do seu espaço.</h1>
            <p>Transforme a sua operação em oportunidades de crescimento.</p>
          </div>
        </div>
        <section className="r-upgrade">
          <span className="r-premium-tag">
            <Icon name="insights" /> Disponível no Pro e Premium
          </span>
          <h2>
            Menos achismo.
            <br />
            Mais decisões com direção.
          </h2>
          <p>
            Descubra horários ociosos, acompanhe a procura e encontre oportunidades para ocupar
            melhor suas quadras.
          </p>
          <div className="r-upgrade-features">
            <span>Mapa de ocupação</span>
            <span>Horários mais procurados</span>
            <span>Oportunidades de promoção</span>
          </div>
          <small>
            Seu plano atual: {PLANOS[conta?.plano || 'freemium']}. Na demonstração, altere o plano
            pela área Superadmin na barra superior. Não há contratação ou cobrança real.
          </small>
        </section>
        <div className="r-preview">
          <Icon name="escudo" size={28} />
          <h3>Uma prévia do que você pode descobrir</h3>
          <p>“Quais horários têm espaço para crescer?” · “Onde a procura é maior?”</p>
          <small>Resultados detalhados disponíveis nos planos pagos.</small>
        </div>
      </>
    );
  return (
    <>
      <div className="g-page-heading">
        <div>
          <span className="g-eyebrow">INTELIGÊNCIA · {PLANOS[conta.plano].toUpperCase()}</span>
          <h1>Seu próximo bom movimento.</h1>
          <p>Entenda a procura. Encontre oportunidades. Faça seu espaço render mais.</p>
        </div>
        <span className="r-premium-tag">
          <Icon name="insights" size={17} /> Benefício do plano
        </span>
      </div>
      <div className="r-demo-notice">
        <Icon name="escudo" size={18} />
        <span>
          Histórico sintético de demonstração, independente da agenda. Insights são sugestões
          baseadas nesses exemplos, não previsões reais ou IA.
        </span>
      </div>
      <div className="r-filters">
        <label>
          Histórico
          <select
            value={semanas}
            onChange={(e) => {
              setSemanas(Number(e.target.value));
              setSelecionada(null);
            }}
          >
            <option value={4}>Últimas 4 semanas</option>
            <option value={8}>Últimas 8 semanas</option>
          </select>
        </label>
        {dados.quadras.length > 1 && (
          <label>
            Quadras
            <select
              value={quadra}
              onChange={(e) => {
                setQuadra(e.target.value);
                setSelecionada(null);
              }}
            >
              <option value="todas">Todas as quadras</option>
              {dados.quadras
                .filter((q) => q.ativa !== false)
                .map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.nome}
                  </option>
                ))}
            </select>
          </label>
        )}
        <small>
          {formatarData(somarDias(referencia, -semanas * 7))} —{' '}
          {formatarData(somarDias(referencia, -1))}
        </small>
      </div>
      <div className="r-metrics">
        <Metric
          label="Ocupação histórica"
          value={`${mapa.ocupacao}%`}
          note={`${mapa.ocupadas} de ${mapa.capacidade} horas disponíveis`}
        />
        <Metric
          label="Maior procura"
          value={mapa.pico ? `${mapa.pico.dia} · ${mapa.pico.hora}h` : '—'}
          note={
            mapa.pico ? `${mapa.pico.percentual}% de ocupação neste horário` : 'Sem quadras ativas'
          }
        />
        <Metric
          label="Espaço para crescer"
          value={mapa.baixa ? `${mapa.baixa.dia} · ${mapa.baixa.hora}h` : '—'}
          note={
            mapa.baixa
              ? `${mapa.baixa.percentual}% de ocupação neste horário`
              : 'Sem histórico disponível'
          }
        />
      </div>
      <section className="r-card">
        <div className="r-card-title">
          <div>
            <h2>O ritmo da sua semana</h2>
            <p>Ocupação média por dia e horário. Clique em uma célula para entender.</p>
          </div>
          <span className="r-legend">
            Menor <i className="r-tone-1" />
            <i className="r-tone-2" />
            <i className="r-tone-3" />
            <i className="r-tone-4" /> Maior
          </span>
        </div>
        <div className="r-heat-scroll">
          <div className="r-heatmap">
            <span>Horário</span>
            {DIAS_CURTOS.map((dia) => (
              <strong key={dia}>{dia}</strong>
            ))}
            {mapa.horas.map((hora) => (
              <div className="r-heat-row" key={hora}>
                <span>{hora}:00</span>
                {mapa.celulas
                  .filter((c) => c.hora === hora)
                  .map((c) => (
                    <button
                      key={c.dia}
                      disabled={c.percentual === null}
                      className={`r-tone-${c.percentual === null ? 0 : c.percentual < 30 ? 1 : c.percentual < 55 ? 2 : c.percentual < 75 ? 3 : 4}${selecionada?.hora === hora && selecionada?.dia === c.dia ? ' selected' : ''}`}
                      aria-label={`${c.dia}, ${hora} horas: ${c.percentual === null ? 'fora do funcionamento' : `${c.percentual}% de ocupação`}`}
                      onClick={() => setSelecionada(c)}
                    >
                      {c.percentual === null ? '—' : `${c.percentual}%`}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
        <div className="r-heat-detail" role="status">
          {selecionada
            ? `${selecionada.dia}, ${selecionada.hora}h às ${selecionada.hora + 1}h · ${selecionada.ocupadas} de ${selecionada.capacidade} horas ocupadas no histórico selecionado.`
            : 'Os percentuais consideram apenas as quadras abertas naquele horário. Não representam disponibilidade para uma nova reserva.'}
        </div>
      </section>
      <div className="r-two-columns">
        <section className="r-card">
          <div className="r-card-title">
            <div>
              <h2>Oportunidades para agir</h2>
              <p>Dados que ajudam a escolher o próximo passo.</p>
            </div>
          </div>
          {mapa.baixa && (
            <div className="r-insight">
              <span className="r-insight-icon">
                <Icon name="dinheiro" />
              </span>
              <div>
                <small>OCUPAÇÃO BAIXA · {mapa.baixa.percentual}%</small>
                <h3>Um horário que pode render mais</h3>
                <p>
                  {mapa.baixa.dia}, das {mapa.baixa.hora}h às {mapa.baixa.hora + 1}h, teve{' '}
                  {mapa.baixa.ocupadas} de {mapa.baixa.capacidade} horas ocupadas. Teste uma oferta
                  nesse intervalo e compare a procura.
                </p>
                <button
                  className="g-btn g-btn-light"
                  onClick={() => setSugestao({ celula: mapa.baixa, percentual: -20 })}
                >
                  Testar 20% de desconto <Icon name="seta" size={16} />
                </button>
              </div>
            </div>
          )}
          {mapa.pico && (
            <div className="r-insight">
              <span className="r-insight-icon">
                <Icon name="pessoas" />
              </span>
              <div>
                <small>DEMANDA ALTA · {mapa.pico.percentual}%</small>
                <h3>Cuide dos seus horários disputados</h3>
                <p>
                  {mapa.pico.dia}, às {mapa.pico.hora}h, é o pico deste histórico. Vale testar uma
                  lista de espera para recuperar vagas canceladas, antes de pensar em descontos.
                </p>
                <span className="r-coming">Lista de espera · conceito para próxima fase</span>
                <button
                  className="g-btn g-btn-light r-suggestion-button"
                  onClick={() => setSugestao({ celula: mapa.pico, percentual: 10 })}
                >
                  Avaliar reajuste de 10% <Icon name="seta" size={16} />
                </button>
              </div>
            </div>
          )}
          {!mapa.pico && (
            <p className="r-empty">Cadastre uma quadra ativa para visualizar os exemplos.</p>
          )}
        </section>
        <section className="r-card">
          <div className="r-card-title">
            <div>
              <h2>Horários mais procurados</h2>
              <p>Ranking de ocupação no histórico selecionado.</p>
            </div>
          </div>
          <div className="r-rank">
            {mapa.ranking.map((c, i) => (
              <div key={`${c.dia}-${c.hora}`}>
                <span>{i + 1}</span>
                <div>
                  <strong>
                    {c.dia} · {c.hora}h às {c.hora + 1}h
                  </strong>
                  <small>
                    {c.ocupadas} de {c.capacidade} horas ocupadas
                  </small>
                </div>
                <b>{c.percentual}%</b>
              </div>
            ))}
          </div>
          <div className="r-learning">
            <Icon name="insights" />
            <p>
              <strong>Um experimento de cada vez.</strong> Depois de uma promoção, compare a
              ocupação do mesmo dia e horário. Mudanças de procura não garantem aumento de lucro.
            </p>
          </div>
        </section>
      </div>
      {sugestao && (
        <Drawer
          titulo="Um teste de preço, com clareza"
          subtitulo="Sugestão demonstrativa · nada aplicado ainda"
          onClose={() => setSugestao(null)}
        >
          <div className="r-price-preview">
            <p>
              <strong>
                {sugestao.celula.dia}, das {sugestao.celula.hora}h às {sugestao.celula.hora + 1}h
              </strong>{' '}
              · {sugestao.celula.percentual}% de ocupação no histórico fictício.
            </p>
            <label className="g-field">
              Ajuste sugerido (%)
              <input
                type="number"
                min={-50}
                max={50}
                step={1}
                value={sugestao.percentual}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  if (p >= -50 && p <= 50) setSugestao((s) => ({ ...s, percentual: p }));
                }}
              />
            </label>
            <p className="r-footnote">
              Percentual ilustrativo para um experimento, não otimização automática. O reajuste pode
              reduzir a procura; compare resultados antes de manter. A prévia usa o preço padrão,
              não sobrepõe regras existentes sem sua confirmação.
            </p>
            {quadras
              .filter(
                (q) =>
                  sugestao.celula.hora >= horaNumero(q.horarioFuncionamento.abertura) &&
                  sugestao.celula.hora + 1 <= horaNumero(q.horarioFuncionamento.fechamento)
              )
              .map((q) => (
                <div className="r-price-option" key={q.id}>
                  <h3>{q.nome}</h3>
                  <div>
                    <span>
                      Preço padrão <b>{formatarPreco(q.precoHora)}/h</b>
                    </span>
                    <Icon name="seta" />
                    <span>
                      Preço sugerido{' '}
                      <b>{formatarPreco(precoSugerido(q.precoHora, sugestao.percentual))}/h</b>
                    </span>
                  </div>
                  <Link
                    className="g-btn g-btn-primary"
                    to="/gestor/configuracoes?aba=precos"
                    state={{
                      sugestao: {
                        quadraId: q.id,
                        nome: `${sugestao.percentual < 0 ? 'Promoção sugerida' : 'Reajuste sugerido'} · ${sugestao.celula.dia}`,
                        tipo: 'semanal',
                        dia: (sugestao.celula.diaIndex + 1) % 7,
                        inicio: `${String(sugestao.celula.hora).padStart(2, '0')}:00`,
                        fim: `${String(sugestao.celula.hora + 1).padStart(2, '0')}:00`,
                        valor: precoSugerido(q.precoHora, sugestao.percentual),
                        promocao: sugestao.percentual < 0,
                      },
                    }}
                  >
                    Preparar regra para {q.nome}
                  </Link>
                </div>
              ))}
            <div className="r-demo-notice">
              A próxima tela permite revisar e salvar a regra. Reservas confirmadas mantêm seus
              valores.
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}
export function Metric({ label, value, note, accent = false }) {
  return (
    <div className={`r-metric${accent ? ' r-metric-accent' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
