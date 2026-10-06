import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SeletorHorario from '../components/SeletorHorario';
import InteresseDialog from '../components/InteresseDialog';
import FiltroBusca from '../components/FiltroBusca';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { buscarEstabelecimento, buscarHorariosDaQuadra } from '../services/quadraService';
import { cotarBusca, cotarHorario } from '../services/gestorDemo';
import { compativel, filtrosDaBusca } from '../utils/estabelecimentos';
import { formatarDataLocalISO } from '../utils/data';
import { formatarData, formatarPreco } from '../utils/formatadores';
import { fotoDaQuadra, rotuloDoEsporte } from '../utils/apresentacaoQuadras';
import {
  chaveDoItem,
  itensDosParametros,
  parametrosDosItens,
  intervaloDoHorario,
} from '../utils/horariosReserva';

export default function EstabelecimentoDetalhe() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [parametros, setParametros] = useSearchParams();
  const busca = parametros.toString();
  const filtros = filtrosDaBusca(busca);
  const data = filtros.data || formatarDataLocalISO();
  const [arena, setArena] = useState(null);
  const [grades, setGrades] = useState({});
  const [itens, setItens] = useState(() => itensDosParametros(parametros));
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [editar, setEditar] = useState(false);
  const [pendente, setPendente] = useState(null);
  const [espera, setEspera] = useState(null);
  useEffect(() => {
    let ativo = true;
    buscarEstabelecimento(id)
      .then((a) => {
        if (ativo) setArena(a);
      })
      .catch(() => {
        if (ativo) {
          setErro('Não foi possível carregar este estabelecimento.');
          setCarregando(false);
        }
      });
    return () => {
      ativo = false;
    };
  }, [id]);
  useEffect(() => {
    if (!arena) return;
    let ativo = true;
    setCarregando(true);
    setErro('');
    Promise.all(arena.quadras.map(async (q) => [q.id, await buscarHorariosDaQuadra(q.id, data)]))
      .then((g) => {
        if (ativo) setGrades(Object.fromEntries(g));
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar os horários. Tente novamente.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [arena, data]);
  const visiveis =
    arena?.quadras
      .map((q) => cotarBusca(q, data, filtros.horario, grades[q.id]?.horariosLivres))
      .filter((q) => compativel(q, filtros, carregando ? undefined : grades[q.id])) || [];
  const itemValido = (item) =>
    item.data === data &&
    visiveis.some(
      (q) => String(q.id) === item.quadraId && grades[q.id]?.horariosLivres.includes(item.horario)
    );
  const invalidos = !carregando && itens.some((item) => !itemValido(item));
  const total = itens.reduce((t, item) => {
    const q = arena?.quadras.find((q) => String(q.id) === item.quadraId);
    return t + (q ? cotarHorario(q, item.data, item.horario).valor : 0);
  }, 0);
  function aplicar(f) {
    if (itens.length) {
      setPendente(f);
      return;
    }
    concluir(f);
  }
  function concluir(f) {
    setItens([]);
    setParametros(new URLSearchParams(Object.entries(f).filter(([k, v]) => k === 'esporte' || v)));
    setEditar(false);
    setPendente(null);
  }
  function alternar(q, horario) {
    const item = { quadraId: String(q.id), data, horario };
    const chave = chaveDoItem(item);
    setItens((atuais) =>
      atuais.some((i) => chaveDoItem(i) === chave)
        ? atuais.filter((i) => chaveDoItem(i) !== chave)
        : [...atuais, item]
    );
  }
  if (!arena)
    return erro ? (
      <p className="container mensagem-erro" role="alert">
        {erro}
      </p>
    ) : (
      <LoadingSpinner mensagem="Carregando estabelecimento..." />
    );
  const contexto = Object.fromEntries(Object.entries(filtros).filter(([k]) => k !== 'item'));
  const continuar = () =>
    navegar(
      `/user/reserva?${parametrosDosItens(itens, { ...contexto, estabelecimento: arena.id })}`
    );
  return (
    <div className="pagina-quadra-detalhe">
      <div className="container">
        <Link className="detalhe-voltar" to={`/user?${new URLSearchParams(contexto)}`}>
          <Icon name="voltar" size={18} /> Voltar à busca
        </Link>
        <div className="detalhe-cabecalho">
          <div>
            <span className="sobretitulo">SEU LUGAR PARA JOGAR</span>
            <h1>{arena.nome}</h1>
            <p>
              <Icon name="local" size={18} /> {arena.bairro}, {arena.cidade}
            </p>
          </div>
        </div>
        <div className="detalhe-foto">
          <img src={fotoDaQuadra(visiveis[0] || arena)} alt={arena.nome} />
          <span>Um espaço para o seu próximo jogo.</span>
        </div>
        <div className="detalhe-layout">
          <div className="detalhe-principal">
            <section className="detalhe-secao">
              <span className="sobretitulo">CONHEÇA O ESTABELECIMENTO</span>
              <h2>Tudo para reunir seu time</h2>
              <p>{arena.descricao}</p>
              <div className="detalhe-infos">
                <div>
                  <Icon name="local" />
                  <span>
                    <strong>Endereço</strong>
                    {arena.endereco}
                  </span>
                </div>
              </div>
              <ul className="detalhe-comodidades">
                {['vestiario', 'estacionamento']
                  .filter((k) => arena.quadras.every((q) => q.estrutura?.[k]))
                  .map((k) => (
                    <li key={k}>
                      <Icon name="check" size={18} />
                      {k === 'vestiario' ? 'Vestiário' : 'Estacionamento'}
                    </li>
                  ))}
              </ul>
            </section>
            <section className="detalhe-secao detalhe-secao-horarios">
              <span className="sobretitulo">SUA PRÓXIMA PARTIDA</span>
              <h2>Escolha a quadra e seus horários</h2>
              <p>
                Combine horários seguidos ou separados, em uma ou mais quadras deste
                estabelecimento.
              </p>
              <p className="lista-espera-aviso">
                <Icon name="relogio" size={16} /> Horário ocupado? Clique nele para entrar na lista
                de espera.
              </p>
              <div className="arena-filtros">
                <span>
                  {filtros.esporte ? rotuloDoEsporte(filtros.esporte) : 'Todos os esportes'}
                </span>
                {filtros.coberta && (
                  <span>{filtros.coberta === 'true' ? 'Coberta' : 'Ao ar livre'}</span>
                )}
                <span>{formatarData(data)}</span>
                {filtros.horario && <span>Busca às {filtros.horario}</span>}
                <button onClick={() => setEditar(!editar)}>Editar filtros</button>
                <button onClick={() => aplicar({ esporte: '', data })}>Limpar filtros</button>
              </div>
              {editar && (
                <FiltroBusca
                  key={busca}
                  variant="results"
                  valoresIniciais={{ ...contexto, data }}
                  onBuscar={aplicar}
                />
              )}
              {pendente && (
                <div className="arena-aviso" role="alert">
                  <strong>Alterar a busca?</strong>
                  <p>
                    Os horários selecionados serão removidos para você escolher novamente com os
                    novos filtros.
                  </p>
                  <Button onClick={() => concluir(pendente)}>Alterar e limpar seleção</Button>
                  <button onClick={() => setPendente(null)}>Manter minha seleção</button>
                </div>
              )}
              <label className="detalhe-campo-data">
                <Icon name="calendario" size={20} />
                <span>Data do jogo</span>
                <input
                  type="date"
                  min={formatarDataLocalISO()}
                  value={data}
                  onChange={(e) => aplicar({ ...contexto, data: e.target.value })}
                />
              </label>
              {erro && (
                <p className="mensagem-erro" role="alert">
                  {erro}
                </p>
              )}
              {carregando ? (
                <LoadingSpinner mensagem="Conferindo disponibilidade..." />
              ) : !visiveis.length ? (
                <div className="resultados-vazios">
                  <h3>Nenhuma quadra corresponde aos filtros.</h3>
                  <p>
                    Altere o horário ou a cobertura para encontrar outras opções. Não mostramos
                    quadras incompatíveis.
                  </p>
                  <button onClick={() => setEditar(true)}>Ajustar busca</button>
                </div>
              ) : (
                visiveis.map((q) => {
                  const grade = grades[q.id];
                  const precos = Object.fromEntries(
                    [...(grade?.horariosLivres || []), ...(grade?.horariosOcupados || [])].map(
                      (h) => {
                        const c = cotarHorario(q, data, h);
                        return [h, { ...c, texto: formatarPreco(c.valor) }];
                      }
                    )
                  );
                  return (
                    <article className="arena-quadra" key={q.id}>
                      <div className="arena-quadra-heading">
                        <img src={fotoDaQuadra(q)} alt={q.nome} />
                        <div>
                          <h3>{q.nome}</h3>
                          <p>
                            {rotuloDoEsporte(q.esporte)} ·{' '}
                            {q.estrutura?.coberta ? 'Coberta' : 'Ao ar livre'} ·{' '}
                            {q.piso ||
                              (q.esporte === 'beach tennis'
                                ? 'Areia'
                                : q.esporte === 'society'
                                  ? 'Grama sintética'
                                  : 'Piso esportivo')}
                          </p>
                          <strong>
                            {!filtros.horario && 'A partir de '}
                            {formatarPreco(q.precoBuscado ?? q.precoHora)} / hora{' '}
                            {q.promocao && '· Promoção'}
                          </strong>
                        </div>
                      </div>
                      <SeletorHorario
                        horariosLivres={grade?.horariosLivres || []}
                        horariosOcupados={grade?.horariosOcupados || []}
                        horariosSelecionados={itens
                          .filter((i) => i.quadraId === String(q.id) && i.data === data)
                          .map((i) => i.horario)}
                        onSelecionarHorario={(h) => alternar(q, h)}
                        onHorarioOcupado={(h) => setEspera({ quadra: q, horario: h })}
                        precos={precos}
                        horarioBuscado={filtros.horario}
                      />
                    </article>
                  );
                })
              )}
            </section>
          </div>
          <aside className="detalhe-reserva">
            <span className="sobretitulo">SUA SELEÇÃO</span>
            <h3>{arena.nome}</h3>
            {itens.length ? (
              <ul className="arena-selecao">
                {itens.map((i) => (
                  <li key={chaveDoItem(i)}>
                    <strong>{arena.quadras.find((q) => String(q.id) === i.quadraId)?.nome}</strong>
                    <span>
                      {formatarData(i.data)} · {intervaloDoHorario(i.horario)}
                    </span>
                    <button
                      aria-label={`Remover ${i.quadraId} ${i.horario}`}
                      onClick={() =>
                        setItens((atuais) =>
                          atuais.filter((a) => chaveDoItem(a) !== chaveDoItem(i))
                        )
                      }
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Escolha os horários nas quadras ao lado.</p>
            )}
            {invalidos && (
              <p role="alert" className="mensagem-erro">
                Algum horário não está mais disponível. Remova-o para continuar.
              </p>
            )}
            <div className="detalhe-total">
              <span>{itens.length} hora(s)</span>
              <strong>{formatarPreco(total)}</strong>
            </div>
            <Button
              disabled={!itens.length || carregando || invalidos || Boolean(erro)}
              onClick={continuar}
            >
              Continuar <Icon name="seta" />
            </Button>
            <p>Confira os itens antes de confirmar.</p>
          </aside>
        </div>
      </div>
      <div className="detalhe-cta-mobile">
        <div>
          <strong>{formatarPreco(total)}</strong>
          <span> no total</span>
          <small>
            {itens.length
              ? `${itens.length} horário(s) selecionado(s)`
              : 'Escolha quadra e horário'}
          </small>
        </div>
        <Button
          disabled={!itens.length || carregando || invalidos || Boolean(erro)}
          onClick={continuar}
        >
          Continuar
        </Button>
      </div>
      {espera && (
        <InteresseDialog
          tipo="espera"
          quadra={espera.quadra}
          horario={espera.horario}
          data={data}
          onClose={() => setEspera(null)}
        />
      )}
    </div>
  );
}
