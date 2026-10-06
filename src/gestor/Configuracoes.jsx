import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGestor } from './context';
import Drawer from './Drawer';
import {
  conflito,
  eventosNoPeriodo,
  diaSemana,
  hoje,
  horaNumero,
  idNovo,
  somarDias,
} from './model';
import Icon from '../components/common/Icon';
import { fotoDaQuadra, rotuloDoEsporte } from '../utils/apresentacaoQuadras';
import { formatarData, formatarPreco } from '../utils/formatadores';

const DIAS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
const ABAS = [
  ['quadras', 'quadra', 'Minhas quadras'],
  ['precos', 'dinheiro', 'Preços e promoções'],
  ['mensalistas', 'pessoas', 'Mensalistas'],
  ['estabelecimento', 'config', 'Estabelecimento'],
];
export default function Configuracoes() {
  const { dados, atualizar, externas } = useGestor();
  const [params, setParams] = useSearchParams();
  const aba = ABAS.some((a) => a[0] === params.get('aba')) ? params.get('aba') : 'quadras';
  const [editor, setEditor] = useState(() =>
    dados.quadras.length === 1 && aba === 'quadras'
      ? { tipo: 'quadras', item: dados.quadras[0] }
      : null
  );
  const [toast, setToast] = useState('');
  const [estabelecimento, setEstabelecimento] = useState(dados.estabelecimento);
  function notify(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 4500);
  }
  const ativa = dados.mensalistas.filter((m) => m.ate >= hoje());
  return (
    <>
      <div className="g-page-heading">
        <div>
          <span className="g-eyebrow">DO SEU JEITO</span>
          <h1>Seu espaço, suas regras.</h1>
          <p>Cuide dos detalhes que fazem a operação funcionar.</p>
        </div>
        {aba !== 'estabelecimento' && (
          <button className="g-btn g-btn-primary" onClick={() => setEditor({ tipo: aba })}>
            <Icon name="mais" />
            {aba === 'quadras'
              ? 'Nova quadra'
              : aba === 'precos'
                ? 'Nova regra de preço'
                : 'Novo mensalista'}
          </button>
        )}
      </div>
      <nav className="g-settings-tabs" aria-label="Seções de configurações">
        {ABAS.map(([id, icone, nome]) => (
          <button
            key={id}
            className={id === aba ? 'ativo' : ''}
            onClick={() => setParams({ aba: id })}
          >
            <Icon name={icone} size={18} />
            {nome}
          </button>
        ))}
      </nav>
      {aba === 'quadras' && (
        <>
          <div className="g-section-heading">
            <div>
              <h2>Os espaços que você administra</h2>
              <p>Informações, fotos e funcionamento de cada quadra.</p>
            </div>
            <span className="g-badge g-badge-gray">{dados.quadras.length} quadras cadastradas</span>
          </div>
          <div className="g-courts-grid">
            {dados.quadras.map((q) => (
              <article className="g-card g-court-card" key={q.id}>
                <div className="g-court-photo">
                  <img src={fotoDaQuadra(q)} alt={q.nome} />
                  <span
                    className={`g-badge ${q.ativa !== false ? 'g-badge-green' : 'g-badge-gray'}`}
                  >
                    {q.ativa !== false ? 'Ativa' : 'Pausada'}
                  </span>
                </div>
                <div className="g-court-info">
                  <small>
                    {rotuloDoEsporte(q.esporte)} · {q.estrutura.coberta ? 'Coberta' : 'Ao ar livre'}
                  </small>
                  <h3>{q.nome}</h3>
                  <p>
                    <Icon name="local" size={15} />
                    {q.bairro}, {q.cidade}
                  </p>
                  <div>
                    <span>
                      <Icon name="relogio" size={15} />
                      {q.horarioFuncionamento.abertura}–{q.horarioFuncionamento.fechamento}
                    </span>
                    <strong>
                      {formatarPreco(q.precoHora)}
                      <small>/h</small>
                    </strong>
                  </div>
                  <button
                    className="g-btn g-btn-light g-full"
                    onClick={() => setEditor({ tipo: 'quadras', item: q })}
                  >
                    Editar quadra <Icon name="seta" size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      {aba === 'precos' && (
        <>
          <div className="g-info-banner">
            <Icon name="dinheiro" />
            <div>
              <strong>O preço certo, em cada horário.</strong>
              <p>
                Exceções de uma data têm prioridade sobre regras semanais e o preço padrão. Reservas
                já confirmadas mantêm seu valor.
              </p>
            </div>
          </div>
          <section className="g-card">
            <div className="g-section-card-heading">
              <h2>Regras de preço</h2>
              <small>Promoções são exibidas ao jogador na data e no horário correspondentes.</small>
            </div>
            {!dados.regras.length ? (
              <div className="g-empty g-empty-rich">
                <span>
                  <Icon name="dinheiro" size={30} />
                </span>
                <h3>Abra espaço para novas partidas.</h3>
                <p>
                  Crie uma promoção em horários menos procurados ou ajuste o preço dos horários de
                  pico.
                </p>
                <button
                  className="g-btn g-btn-primary"
                  onClick={() => setEditor({ tipo: 'precos' })}
                >
                  <Icon name="mais" />
                  Criar primeira regra
                </button>
              </div>
            ) : (
              <div className="g-table-wrap">
                <table className="g-table">
                  <thead>
                    <tr>
                      <th>Regra</th>
                      <th>Quadra</th>
                      <th>Quando</th>
                      <th>Valor / hora</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {dados.regras.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.nome}</strong>
                          <small>{r.promocao ? 'Promoção para o jogador' : 'Preço especial'}</small>
                        </td>
                        <td>
                          {dados.quadras.find((q) => String(q.id) === String(r.quadraId))?.nome}
                        </td>
                        <td>
                          <strong>{r.tipo === 'data' ? formatarData(r.data) : DIAS[r.dia]}</strong>
                          <small>
                            {r.inicio} às {r.fim}
                          </small>
                        </td>
                        <td>{formatarPreco(r.valor)}</td>
                        <td>
                          <button
                            className="g-btn g-btn-light"
                            onClick={() => setEditor({ tipo: 'precos', item: r })}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
      {aba === 'mensalistas' && (
        <>
          <div className="g-info-banner">
            <Icon name="pessoas" />
            <div>
              <strong>O mesmo time. O mesmo horário.</strong>
              <p>
                Reserve horários recorrentes e acompanhe o acordo mensal. Cada ocorrência aparece
                automaticamente na agenda.
              </p>
            </div>
            <span className="g-badge g-badge-green">{ativa.length} ativos</span>
          </div>
          <div className="g-monthly-grid">
            {dados.mensalistas.map((m) => (
              <article className="g-card g-monthly-card" key={m.id}>
                <div className="g-monthly-head">
                  <span className="g-client-avatar">
                    {m.cliente
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')}
                  </span>
                  <div>
                    <h3>{m.cliente}</h3>
                    <small>{m.telefone}</small>
                  </div>
                  <span className={`g-badge ${m.ate >= hoje() ? 'g-badge-green' : 'g-badge-gray'}`}>
                    {m.ate >= hoje() ? 'Ativo' : 'Encerrado'}
                  </span>
                </div>
                <div className="g-monthly-schedule">
                  <Icon name="calendario" />
                  <div>
                    <strong>Toda {DIAS[m.dia].toLowerCase()}</strong>
                    <span>
                      {m.inicio} às {m.fim} ·{' '}
                      {dados.quadras.find((q) => String(q.id) === String(m.quadraId))?.nome}
                    </span>
                  </div>
                </div>
                <div className="g-monthly-value">
                  <span>
                    <strong>{formatarPreco(m.valorMensal)}</strong>
                    <small>/ mês</small>
                  </span>
                  <span
                    className={`g-badge ${m.pagamento === 'pago' ? 'g-badge-green' : 'g-badge-amber'}`}
                  >
                    {m.pagamento === 'pago' ? 'Mês recebido' : 'Mês a receber'}
                  </span>
                </div>
                <small>
                  Vigência: {formatarData(m.de)} até {formatarData(m.ate)}
                </small>
                <button
                  className="g-btn g-btn-light g-full"
                  onClick={() => setEditor({ tipo: 'mensalistas', item: m })}
                >
                  Editar acordo e recorrência <Icon name="seta" size={17} />
                </button>
              </article>
            ))}
          </div>
          {!dados.mensalistas.length && (
            <div className="g-empty">
              Cadastre o primeiro mensalista para reservar horários recorrentes.
            </div>
          )}
        </>
      )}
      {aba === 'estabelecimento' && (
        <section className="g-card g-estabelecimento">
          <div className="g-section-card-heading">
            <h2>Informações da sua operação</h2>
            <p>
              Nome, endereço e contato são compartilhados por todas as quadras do estabelecimento.
            </p>
          </div>
          <form
            className="g-form"
            onSubmit={(e) => {
              e.preventDefault();
              atualizar((d) => ({
                ...d,
                estabelecimento,
                quadras: d.quadras.map((q) => ({
                  ...q,
                  endereco: estabelecimento.endereco,
                  bairro: estabelecimento.bairro,
                  cidade: estabelecimento.cidade,
                })),
              }));
              notify('Informações atualizadas.');
            }}
          >
            <label className="g-field">
              Nome comercial
              <input
                required
                value={estabelecimento.nome}
                onChange={(e) => setEstabelecimento((f) => ({ ...f, nome: e.target.value }))}
              />
            </label>
            <div className="g-form-row">
              <label className="g-field">
                Contato
                <input
                  required
                  type="tel"
                  value={estabelecimento.contato}
                  onChange={(e) => setEstabelecimento((f) => ({ ...f, contato: e.target.value }))}
                />
              </label>
              <label className="g-field">
                Cidade
                <input
                  required
                  value={estabelecimento.cidade}
                  onChange={(e) => setEstabelecimento((f) => ({ ...f, cidade: e.target.value }))}
                />
              </label>
            </div>
            <label className="g-field">
              Endereço do estabelecimento
              <input
                required
                value={estabelecimento.endereco || ''}
                onChange={(e) => setEstabelecimento((f) => ({ ...f, endereco: e.target.value }))}
              />
            </label>
            <label className="g-field">
              Bairro do estabelecimento
              <input
                required
                value={estabelecimento.bairro || ''}
                onChange={(e) => setEstabelecimento((f) => ({ ...f, bairro: e.target.value }))}
              />
            </label>
            <div className="g-info-banner">
              <Icon name="escudo" />
              <div>
                <strong>Política de cancelamento</strong>
                <p>
                  Antecedência padrão: 24 horas. Exceções do gestor exigem motivo registrado.
                  Reembolsos são simulados.
                </p>
              </div>
            </div>
            <button className="g-btn g-btn-primary" type="submit">
              Salvar informações
            </button>
          </form>
        </section>
      )}
      {editor && (
        <EditorConfiguracao
          key={`${editor.tipo}-${editor.item?.id || 'novo'}`}
          editor={editor}
          onClose={() => setEditor(null)}
          notify={notify}
          dados={dados}
          atualizar={atualizar}
          externas={externas}
        />
      )}
      {toast && (
        <div role="status" className="g-toast">
          <Icon name="check" />
          {toast}
        </div>
      )}
    </>
  );
}

function EditorConfiguracao({ editor, onClose, notify, dados, atualizar, externas }) {
  const { tipo, item } = editor;
  const padraoQuadra = {
    nome: '',
    esporte: 'society',
    descricao: '',
    bairro: '',
    cidade: 'Curitiba',
    endereco: '',
    precoHora: 100,
    estrutura: { coberta: false, vestiario: true, estacionamento: false, iluminacao: true },
    horarioFuncionamento: { abertura: '08:00', fechamento: '23:00' },
    fotos: [],
    ativa: true,
  };
  const [f, setF] = useState(
    tipo === 'quadras'
      ? { ...padraoQuadra, ...item }
      : tipo === 'precos'
        ? {
            quadraId: dados.quadras[0]?.id,
            nome: '',
            tipo: 'data',
            data: hoje(),
            dia: 1,
            inicio: '14:00',
            fim: '17:00',
            valor: 80,
            promocao: true,
            ...item,
          }
        : {
            quadraId: dados.quadras[0]?.id,
            cliente: '',
            telefone: '',
            dia: 4,
            inicio: '17:00',
            fim: '18:00',
            de: hoje(),
            ate: somarDias(hoje(), 90),
            valorMensal: 400,
            pagamento: 'pendente',
            excecoes: [],
            ...item,
          }
  );
  const [erro, setErro] = useState('');
  const [escopo, setEscopo] = useState('futuras');
  const [efetiva, setEfetiva] = useState(hoje());
  const mudar = (k, v) => setF((a) => ({ ...a, [k]: v }));
  async function fotos(e) {
    const arquivos = [...e.target.files];
    if (arquivos.some((file) => file.size > 500000))
      return setErro('Use imagens de até 500 KB cada para este protótipo.');
    if (f.fotos.length + arquivos.length > 4) return setErro('Use no máximo 4 fotos por quadra.');
    const resultados = await Promise.all(
      arquivos.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    ).catch(() => null);
    if (!resultados) return setErro('Não foi possível ler a foto. Tente outra imagem.');
    mudar('fotos', [...f.fotos, ...resultados]);
    setErro('');
  }
  function salvar(e) {
    e.preventDefault();
    setErro('');
    try {
      if (tipo === 'quadras') {
        if (
          horaNumero(f.horarioFuncionamento.fechamento) <=
          horaNumero(f.horarioFuncionamento.abertura)
        )
          return setErro('O fechamento deve ser depois da abertura.');
        const quadra = {
          ...f,
          endereco: dados.estabelecimento.endereco,
          bairro: dados.estabelecimento.bairro,
          cidade: dados.estabelecimento.cidade,
          id: item?.id || `local-${idNovo()}`,
          precoHora: Number(f.precoHora),
        };
        atualizar((d) => ({
          ...d,
          quadras: item
            ? d.quadras.map((q) => (q.id === item.id ? quadra : q))
            : [...d.quadras, quadra],
        }));
      } else if (tipo === 'precos') {
        const quadra = dados.quadras.find((q) => String(q.id) === String(f.quadraId));
        if (horaNumero(f.fim) <= horaNumero(f.inicio))
          return setErro('O fim deve ser depois do início.');
        if (
          !quadra ||
          horaNumero(f.inicio) < horaNumero(quadra.horarioFuncionamento.abertura) ||
          horaNumero(f.fim) > horaNumero(quadra.horarioFuncionamento.fechamento)
        )
          return setErro('Escolha horários dentro do funcionamento da quadra.');
        const regra = { ...f, id: item?.id || idNovo(), valor: Number(f.valor) };
        atualizar((d) => ({
          ...d,
          regras: item ? d.regras.map((r) => (r.id === item.id ? regra : r)) : [...d.regras, regra],
        }));
      } else {
        const quadra = dados.quadras.find((q) => String(q.id) === String(f.quadraId));
        if (
          !quadra ||
          horaNumero(f.fim) <= horaNumero(f.inicio) ||
          horaNumero(f.inicio) < horaNumero(quadra.horarioFuncionamento.abertura) ||
          horaNumero(f.fim) > horaNumero(quadra.horarioFuncionamento.fechamento)
        )
          return setErro('Escolha um intervalo válido dentro do funcionamento da quadra.');
        if (f.telefone.replace(/\D/g, '').length < 10)
          return setErro('Informe um telefone com DDD.');
        if (f.ate < f.de) return setErro('O fim da vigência deve ser depois do início.');
        if (new Date(`${f.ate}T12:00:00`) - new Date(`${f.de}T12:00:00`) > 366 * 86400000)
          return setErro('Defina uma vigência de até um ano para o protótipo.');
        const de = item ? efetiva : f.de;
        if (de > f.ate) return setErro('A data da alteração deve estar dentro da vigência.');
        if (
          item &&
          escopo === 'ocorrencia' &&
          (diaSemana(efetiva) !== Number(item.dia) ||
            efetiva < item.de ||
            efetiva > item.ate ||
            item.excecoes?.includes(efetiva))
        )
          return setErro('Escolha uma ocorrência existente deste mensalista.');
        const semAtual = {
          ...dados,
          mensalistas: dados.mensalistas.filter((m) => m.id !== item?.id),
        };
        const periodo = eventosNoPeriodo(semAtual, de, f.ate);
        for (let data = de; data <= f.ate; data = somarDias(data, 1)) {
          if (
            item && escopo === 'ocorrencia' ? data !== efetiva : diaSemana(data) !== Number(f.dia)
          )
            continue;
          if (conflito([...periodo, ...externas], { ...f, data }))
            return setErro(
              `Existe um conflito em ${formatarData(data)}. Revise o horário antes de salvar.`
            );
          if (item && escopo === 'ocorrencia') break;
        }
        const mensalista = { ...f, id: item?.id || idNovo(), valorMensal: Number(f.valorMensal) };
        if (item && escopo === 'ocorrencia')
          atualizar((d) => ({
            ...d,
            mensalistas: d.mensalistas.map((m) =>
              m.id === item.id ? { ...m, excecoes: [...(m.excecoes || []), efetiva] } : m
            ),
            eventos: [
              ...d.eventos,
              {
                id: idNovo(),
                mensalistaId: item.id,
                valorMensalReferencia: Number(f.valorMensal),
                quadraId: f.quadraId,
                data: efetiva,
                inicio: f.inicio,
                fim: f.fim,
                cliente: f.cliente,
                telefone: f.telefone,
                tipo: 'mensalista',
                origem: 'Mensalista · exceção',
                metodo: 'mensalidade',
                pagamento: f.pagamento,
                status: 'confirmada',
                valor: 0,
              },
            ],
          }));
        else if (item)
          atualizar((d) => ({
            ...d,
            mensalistas: [
              ...d.mensalistas.map((m) =>
                m.id === item.id ? { ...m, ate: somarDias(efetiva, -1) } : m
              ),
              { ...mensalista, id: idNovo(), de: efetiva, excecoes: [] },
            ],
          }));
        else atualizar((d) => ({ ...d, mensalistas: [...d.mensalistas, mensalista] }));
      }
      notify('Configuração salva.');
      onClose();
    } catch {
      setErro(
        'Não foi possível salvar neste navegador. Reduza a quantidade ou o tamanho das fotos e tente novamente.'
      );
    }
  }
  return (
    <Drawer
      titulo={
        tipo === 'quadras'
          ? item
            ? 'Editar quadra'
            : 'Um novo espaço para jogar'
          : tipo === 'precos'
            ? item
              ? 'Editar regra de preço'
              : 'Preço certo, na hora certa'
            : item
              ? 'Editar mensalista'
              : 'Um lugar fixo na agenda'
      }
      subtitulo={
        tipo === 'quadras'
          ? 'Tudo que o jogador precisa saber sobre seu espaço.'
          : tipo === 'precos'
            ? 'Valores aplicados às próximas reservas.'
            : 'Defina o acordo e a recorrência de horários.'
      }
      onClose={onClose}
    >
      <form className="g-form" onSubmit={salvar}>
        {tipo === 'quadras' ? (
          <>
            <label className="g-field">
              Nome da quadra
              <input required value={f.nome} onChange={(e) => mudar('nome', e.target.value)} />
            </label>
            <div className="g-form-row">
              <label className="g-field">
                Esporte
                <select value={f.esporte} onChange={(e) => mudar('esporte', e.target.value)}>
                  {['society', 'futsal', 'campo', 'beach tennis', 'basquete', 'volei'].map((s) => (
                    <option key={s} value={s}>
                      {rotuloDoEsporte(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="g-field">
                Preço padrão / hora (R$)
                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={f.precoHora}
                  onChange={(e) => mudar('precoHora', e.target.value)}
                />
              </label>
            </div>
            <label className="g-field">
              Descrição
              <textarea
                required
                value={f.descricao}
                onChange={(e) => mudar('descricao', e.target.value)}
              />
            </label>
            <div className="g-info-banner">
              <Icon name="local" />
              <div>
                <strong>{dados.estabelecimento.nome}</strong>
                <p>
                  {dados.estabelecimento.endereco} · {dados.estabelecimento.bairro},{' '}
                  {dados.estabelecimento.cidade}. Endereço e contato são definidos em
                  Estabelecimento.
                </p>
              </div>
            </div>
            <div className="g-form-row">
              <label className="g-field">
                Abertura
                <input
                  required
                  type="time"
                  step="3600"
                  value={f.horarioFuncionamento.abertura}
                  onInput={(e) =>
                    mudar('horarioFuncionamento', {
                      ...f.horarioFuncionamento,
                      abertura: e.currentTarget.value,
                    })
                  }
                  onChange={(e) =>
                    mudar('horarioFuncionamento', {
                      ...f.horarioFuncionamento,
                      abertura: e.target.value,
                    })
                  }
                />
              </label>
              <label className="g-field">
                Fechamento
                <input
                  required
                  type="time"
                  step="3600"
                  value={f.horarioFuncionamento.fechamento}
                  onInput={(e) =>
                    mudar('horarioFuncionamento', {
                      ...f.horarioFuncionamento,
                      fechamento: e.currentTarget.value,
                    })
                  }
                  onChange={(e) =>
                    mudar('horarioFuncionamento', {
                      ...f.horarioFuncionamento,
                      fechamento: e.target.value,
                    })
                  }
                />
              </label>
            </div>
            <div className="g-checkbox-grid">
              {Object.entries({
                coberta: 'Coberta',
                vestiario: 'Vestiário',
                estacionamento: 'Estacionamento',
                iluminacao: 'Iluminação',
              }).map(([k, label]) => (
                <label key={k}>
                  <input
                    type="checkbox"
                    checked={f.estrutura[k]}
                    onChange={(e) => mudar('estrutura', { ...f.estrutura, [k]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="g-form-divider">FOTOS DO ESPAÇO</div>
            <div className="g-photo-previews">
              {f.fotos.map((src, i) => (
                <div key={i}>
                  <img src={src} alt={`Foto ${i + 1}`} />
                  <button
                    type="button"
                    aria-label={`Remover foto ${i + 1}`}
                    onClick={() =>
                      mudar(
                        'fotos',
                        f.fotos.filter((_, j) => i !== j)
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <label className="g-upload">
              <Icon name="foto" />
              Adicionar fotos <small>JPG, PNG ou WebP · até 500 KB por foto</small>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={fotos}
              />
            </label>
            <label className="g-checkbox">
              <input
                type="checkbox"
                checked={f.ativa !== false}
                onChange={(e) => mudar('ativa', e.target.checked)}
              />
              Quadra ativa e visível para novas reservas
            </label>
          </>
        ) : (
          <>
            <label className="g-field">
              Quadra
              <select value={f.quadraId} onChange={(e) => mudar('quadraId', e.target.value)}>
                {dados.quadras.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.nome}
                  </option>
                ))}
              </select>
            </label>
            {tipo === 'precos' ? (
              <>
                <label className="g-field">
                  Nome da regra
                  <input
                    required
                    value={f.nome}
                    placeholder="Ex.: Jogue à tarde por menos"
                    onChange={(e) => mudar('nome', e.target.value)}
                  />
                </label>
                <label className="g-field">
                  Aplicar em
                  <select value={f.tipo} onChange={(e) => mudar('tipo', e.target.value)}>
                    <option value="data">Uma data específica</option>
                    <option value="semanal">Toda semana</option>
                  </select>
                </label>
                {f.tipo === 'data' ? (
                  <label className="g-field">
                    Data
                    <input
                      required
                      type="date"
                      min={hoje()}
                      value={f.data}
                      onInput={(e) => mudar('data', e.currentTarget.value)}
                      onChange={(e) => mudar('data', e.target.value)}
                    />
                  </label>
                ) : (
                  <label className="g-field">
                    Dia da semana
                    <select value={f.dia} onChange={(e) => mudar('dia', e.target.value)}>
                      {DIAS.map((dia, i) => (
                        <option key={dia} value={i}>
                          {dia}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            ) : (
              <>
                <label className="g-field">
                  Nome do cliente / grupo
                  <input
                    required
                    value={f.cliente}
                    onChange={(e) => mudar('cliente', e.target.value)}
                  />
                </label>
                <label className="g-field">
                  Telefone com DDD
                  <input
                    required
                    type="tel"
                    value={f.telefone}
                    onChange={(e) => mudar('telefone', e.target.value)}
                  />
                </label>
                {item && (
                  <>
                    <label className="g-field">
                      O que deseja alterar?
                      <select value={escopo} onChange={(e) => setEscopo(e.target.value)}>
                        <option value="futuras">Esta e as próximas ocorrências</option>
                        <option value="ocorrencia">Somente uma ocorrência</option>
                      </select>
                    </label>
                    <label className="g-field">
                      A partir de / data da ocorrência
                      <input
                        required
                        type="date"
                        min={hoje()}
                        value={efetiva}
                        onInput={(e) => setEfetiva(e.currentTarget.value)}
                        onChange={(e) => setEfetiva(e.target.value)}
                      />
                    </label>
                  </>
                )}
                <label className="g-field">
                  Dia da semana
                  <select value={f.dia} onChange={(e) => mudar('dia', e.target.value)}>
                    {DIAS.map((dia, i) => (
                      <option key={dia} value={i}>
                        {dia}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <div className="g-form-row">
              <label className="g-field">
                Início
                <input
                  required
                  type="time"
                  step="3600"
                  value={f.inicio}
                  onInput={(e) => mudar('inicio', e.currentTarget.value)}
                  onChange={(e) => mudar('inicio', e.target.value)}
                />
              </label>
              <label className="g-field">
                Fim
                <input
                  required
                  type="time"
                  step="3600"
                  value={f.fim}
                  onInput={(e) => mudar('fim', e.currentTarget.value)}
                  onChange={(e) => mudar('fim', e.target.value)}
                />
              </label>
            </div>
            {tipo === 'precos' ? (
              <>
                <label className="g-field">
                  Valor por hora (R$)
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={f.valor}
                    onChange={(e) => mudar('valor', e.target.value)}
                  />
                </label>
                <label className="g-checkbox">
                  <input
                    type="checkbox"
                    checked={f.promocao}
                    onChange={(e) => mudar('promocao', e.target.checked)}
                  />
                  Exibir como promoção para o jogador
                </label>
              </>
            ) : (
              <>
                <div className="g-form-row">
                  <label className="g-field">
                    Início da vigência
                    <input
                      required
                      type="date"
                      value={f.de}
                      onInput={(e) => mudar('de', e.currentTarget.value)}
                      onChange={(e) => mudar('de', e.target.value)}
                    />
                  </label>
                  <label className="g-field">
                    Fim da vigência
                    <input
                      required
                      type="date"
                      value={f.ate}
                      onInput={(e) => mudar('ate', e.currentTarget.value)}
                      onChange={(e) => mudar('ate', e.target.value)}
                    />
                  </label>
                </div>
                <label className="g-field">
                  Valor mensal (R$)
                  <input
                    required
                    min="1"
                    type="number"
                    step="0.01"
                    value={f.valorMensal}
                    onChange={(e) => mudar('valorMensal', e.target.value)}
                  />
                </label>
                <label className="g-field">
                  Pagamento do mês
                  <select value={f.pagamento} onChange={(e) => mudar('pagamento', e.target.value)}>
                    <option value="pendente">A receber</option>
                    <option value="pago">Recebido</option>
                  </select>
                </label>
              </>
            )}
          </>
        )}
        {erro && (
          <p role="alert" className="g-error">
            {erro}
          </p>
        )}
        <button className="g-btn g-btn-primary g-full" type="submit">
          <Icon name="check" />
          Salvar{' '}
          {tipo === 'quadras' ? 'quadra' : tipo === 'precos' ? 'regra de preço' : 'mensalista'}
        </button>
      </form>
    </Drawer>
  );
}
