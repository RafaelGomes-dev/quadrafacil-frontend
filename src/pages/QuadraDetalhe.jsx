import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SeletorHorario from '../components/SeletorHorario';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { buscarHorariosDaQuadra, buscarQuadraPorId } from '../services/quadraService';
import { formatarDataLocalISO } from '../utils/data';
import { formatarData, formatarPreco } from '../utils/formatadores';
import { fotoDaQuadra, rotuloDoEsporte } from '../utils/apresentacaoQuadras';
import { normalizarHorarios, parametrosDaReserva } from '../utils/horariosReserva';
import { cotarHorario } from '../services/gestorDemo';

const ITENS_DE_ESTRUTURA = [
  { chave: 'vestiario', rotulo: 'Vestiário' },
  { chave: 'estacionamento', rotulo: 'Estacionamento' },
  { chave: 'iluminacao', rotulo: 'Iluminação' },
  { chave: 'coberta', rotulo: 'Quadra coberta' },
];

/** Perfil da quadra: estrutura, fotos e grade de horários para reserva. */
function QuadraDetalhe() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [parametrosDeBusca] = useSearchParams();
  const dataMinima = formatarDataLocalISO();
  const dataDaBusca = parametrosDeBusca.get('data');
  const horariosDaBusca = parametrosDeBusca.getAll('horario').join(',');

  const [quadra, setQuadra] = useState(null);
  const [dataEscolhida, setDataEscolhida] = useState(
    dataDaBusca && dataDaBusca >= dataMinima ? dataDaBusca : dataMinima
  );
  const [horarios, setHorarios] = useState({ horariosLivres: [], horariosOcupados: [] });
  const [horariosSelecionados, setHorariosSelecionados] = useState([]);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [erroDaQuadra, setErroDaQuadra] = useState('');
  const [erroDosHorarios, setErroDosHorarios] = useState('');
  const precos = quadra
    ? Object.fromEntries(
        [...horarios.horariosLivres, ...horarios.horariosOcupados].map((h) => {
          const cotacao = cotarHorario(quadra, dataEscolhida, h);
          return [h, { ...cotacao, texto: formatarPreco(cotacao.valor) }];
        })
      )
    : {};
  const totalSelecionado = horariosSelecionados.reduce(
    (total, h) => total + (precos[h]?.valor || quadra?.precoHora || 0),
    0
  );

  useEffect(() => {
    let cancelado = false;
    setErroDaQuadra('');
    buscarQuadraPorId(id)
      .then((quadraEncontrada) => {
        if (!cancelado) setQuadra(quadraEncontrada);
      })
      .catch((erro) => {
        console.error('Falha ao carregar quadra:', erro);
        if (!cancelado) setErroDaQuadra('Quadra não encontrada.');
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelado = false;
    setEstaCarregando(true);
    setErroDosHorarios('');
    setHorariosSelecionados([]);

    buscarHorariosDaQuadra(id, dataEscolhida)
      .then((grade) => {
        if (!cancelado) {
          setHorarios(grade);
          if (dataEscolhida === dataDaBusca) {
            setHorariosSelecionados(
              normalizarHorarios(horariosDaBusca.split(',')).filter((h) =>
                grade.horariosLivres.includes(h)
              )
            );
          }
        }
      })
      .catch((erro) => {
        console.error('Falha ao carregar horários:', erro);
        if (!cancelado) setErroDosHorarios('Não foi possível carregar os horários desta data.');
      })
      .finally(() => {
        if (!cancelado) setEstaCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id, dataEscolhida, dataDaBusca, horariosDaBusca]);

  function alternarHorario(horario) {
    setHorariosSelecionados((atuais) =>
      atuais.includes(horario)
        ? atuais.filter((item) => item !== horario)
        : normalizarHorarios([...atuais, horario])
    );
  }

  function irParaReserva() {
    navegar(`/user/reserva?${parametrosDaReserva(id, dataEscolhida, horariosSelecionados)}`);
  }

  if (erroDaQuadra && !quadra) {
    return (
      <p className="container mensagem-erro" role="alert">
        {erroDaQuadra}
      </p>
    );
  }

  if (!quadra) {
    return <LoadingSpinner mensagem="Carregando quadra..." />;
  }

  return (
    <div className="pagina-quadra-detalhe">
      <div className="container">
        <Link className="detalhe-voltar" to="/user/quadras">
          <Icon name="voltar" size={18} /> Voltar às quadras
        </Link>

        <div className="detalhe-cabecalho">
          <div>
            <span className="sobretitulo">{rotuloDoEsporte(quadra.esporte)}</span>
            <h1>{quadra.nome}</h1>
            <p>
              <Icon name="local" size={18} /> {quadra.bairro}, {quadra.cidade}
            </p>
          </div>
          <span className="detalhe-etiqueta">
            {quadra.estrutura?.coberta ? 'Coberta' : 'Ao ar livre'}
          </span>
        </div>

        <div className="detalhe-foto">
          <img src={fotoDaQuadra(quadra)} alt={`Quadra ${quadra.nome}`} />
          <span>Um espaço para o seu próximo jogo.</span>
        </div>

        <div className="detalhe-layout">
          <div className="detalhe-principal">
            <section className="detalhe-secao">
              <span className="sobretitulo">CONHEÇA O ESPAÇO</span>
              <h2>Sobre a quadra</h2>
              <p>{quadra.descricao}</p>
              <div className="detalhe-infos">
                <div>
                  <Icon name="local" size={21} />
                  <span>
                    <strong>Endereço</strong>
                    {quadra.endereco}
                  </span>
                </div>
                <div>
                  <Icon name="relogio" size={21} />
                  <span>
                    <strong>Funcionamento</strong>
                    {quadra.horarioFuncionamento?.abertura} às{' '}
                    {quadra.horarioFuncionamento?.fechamento}
                  </span>
                </div>
              </div>
            </section>

            <section className="detalhe-secao">
              <span className="sobretitulo">ESTRUTURA</span>
              <h2>O que este espaço oferece</h2>
              <ul className="detalhe-comodidades">
                {ITENS_DE_ESTRUTURA.map((item) => (
                  <li
                    key={item.chave}
                    className={!quadra.estrutura?.[item.chave] ? 'indisponivel' : ''}
                  >
                    <Icon name="check" size={18} />
                    {item.rotulo}
                  </li>
                ))}
              </ul>
            </section>

            <section className="detalhe-secao detalhe-secao-horarios">
              <span className="sobretitulo">SUA PRÓXIMA PARTIDA</span>
              <h2>Escolha seus horários</h2>
              <p>
                Selecione um ou mais horários, seguidos ou separados. Cada horário corresponde a 1
                hora de quadra.
              </p>
              <label className="detalhe-campo-data">
                <Icon name="calendario" size={20} />
                <span>Data do jogo</span>
                <input
                  type="date"
                  min={dataMinima}
                  required
                  value={dataEscolhida}
                  onInput={(evento) => setDataEscolhida(evento.currentTarget.value)}
                  onChange={(evento) => setDataEscolhida(evento.target.value)}
                />
              </label>

              <div className="detalhe-horarios-cabecalho">
                <strong>{formatarData(dataEscolhida)}</strong>
                <span>{horarios.horariosLivres.length} disponíveis</span>
              </div>
              {erroDosHorarios ? (
                <p className="mensagem-erro" role="alert">
                  {erroDosHorarios}
                </p>
              ) : estaCarregando ? (
                <LoadingSpinner mensagem="Carregando horários..." />
              ) : (
                <SeletorHorario
                  horariosLivres={horarios.horariosLivres}
                  horariosOcupados={horarios.horariosOcupados}
                  horariosSelecionados={horariosSelecionados}
                  onSelecionarHorario={alternarHorario}
                  precos={precos}
                />
              )}
              <p className="detalhe-legenda-horarios">
                Toque novamente para desmarcar. Horários em cinza já estão ocupados.
              </p>
            </section>
          </div>

          <aside className="detalhe-reserva">
            <p className="detalhe-preco">
              <strong>{formatarPreco(quadra.precoHora)}</strong> / hora
            </p>
            <div className="detalhe-resumo-linha">
              <Icon name="calendario" size={19} /> {formatarData(dataEscolhida)}
            </div>
            <div className="detalhe-resumo-linha">
              <Icon name="relogio" size={19} />{' '}
              {horariosSelecionados.join(' · ') || 'Selecione seus horários'}
            </div>
            {horariosSelecionados.length > 0 && (
              <div className="detalhe-total">
                <span>
                  {horariosSelecionados.length}{' '}
                  {horariosSelecionados.length === 1 ? 'hora' : 'horas'} selecionadas
                </span>
                <strong>{formatarPreco(totalSelecionado)}</strong>
              </div>
            )}
            <Button
              disabled={!horariosSelecionados.length || estaCarregando || Boolean(erroDosHorarios)}
              onClick={irParaReserva}
            >
              Continuar <Icon name="seta" size={19} />
            </Button>
            <p>Você ainda vai conferir todos os dados antes de confirmar.</p>
          </aside>
        </div>
      </div>

      <div className="detalhe-cta-mobile">
        <div>
          <strong>
            {formatarPreco(horariosSelecionados.length ? totalSelecionado : quadra.precoHora)}
          </strong>
          <span>{horariosSelecionados.length ? ' no total' : ' / hora'}</span>
          <small>
            {horariosSelecionados.length
              ? `${formatarData(dataEscolhida)} · ${horariosSelecionados.length} ${horariosSelecionados.length === 1 ? 'horário' : 'horários'}`
              : 'Escolha seus horários'}
          </small>
        </div>
        <Button
          disabled={!horariosSelecionados.length || estaCarregando || Boolean(erroDosHorarios)}
          onClick={irParaReserva}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

export default QuadraDetalhe;
