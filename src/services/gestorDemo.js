import {
  conflito,
  eventosNoPeriodo,
  horaNumero,
  horaTexto,
  idNovo,
  lerGestor,
  precoNoHorario,
  salvarGestor,
  dadosIniciais,
} from '../gestor/model';
export function quadraLocal(id) {
  const dados = lerGestor();
  const q = dados?.quadras.find((q) => String(q.id) === String(id));
  return q ? identificar(q, dados.estabelecimento) : null;
}
function identificar(q, e) {
  return {
    ...q,
    estabelecimentoId: e.id,
    estabelecimentoNome: e.nome,
    endereco: e.endereco || q.endereco,
    bairro: e.bairro || q.bairro,
    cidade: e.cidade || q.cidade,
  };
}
export function mesclarQuadras(lista) {
  let dados = lerGestor();
  if (!dados) {
    dados = dadosIniciais();
    salvarGestor(dados);
  }
  const mapa = new Map(lista.map((q) => [String(q.id), q]));
  dados.quadras.forEach((q) => mapa.set(String(q.id), identificar(q, dados.estabelecimento)));
  return [...mapa.values()].filter((q) => q.ativa !== false);
}
export function gradeLocal(quadra, data, ocupadosApi = []) {
  const dados = lerGestor();
  const eventos = dados
    ? eventosNoPeriodo(dados, data, data).filter(
        (e) => e.status !== 'cancelada' && String(e.quadraId) === String(quadra.id)
      )
    : [];
  const todos = [];
  for (
    let h = horaNumero(quadra.horarioFuncionamento.abertura);
    h + 1 <= horaNumero(quadra.horarioFuncionamento.fechamento);
    h++
  )
    todos.push(horaTexto(h));
  const ocupados = todos.filter(
    (h) =>
      ocupadosApi.includes(h) ||
      eventos.some(
        (e) => horaNumero(h) < horaNumero(e.fim) && horaNumero(h) + 1 > horaNumero(e.inicio)
      )
  );
  return { horariosLivres: todos.filter((h) => !ocupados.includes(h)), horariosOcupados: ocupados };
}
export function cotarHorario(quadra, data, horario) {
  return precoNoHorario(lerGestor(), quadra, data, horario);
}
export function cotarBusca(quadra, data, horario, horariosLivres) {
  if (!data) return quadra;
  const horas = horario ? [horario] : (horariosLivres ?? gradeLocal(quadra, data).horariosLivres);
  const precos = horas.map((h) => cotarHorario(quadra, data, h));
  const menor = precos.reduce((a, b) => (b.valor < a.valor ? b : a), {
    valor: Infinity,
    promocao: false,
  });
  const cotacao = horario ? precos[0] : menor;
  return {
    ...quadra,
    precoBuscado: Number.isFinite(cotacao?.valor) ? cotacao.valor : quadra.precoHora,
    promocao: cotacao?.promocao,
    rotuloPromocao: cotacao?.rotulo,
    precoAPartirDe: !horario,
  };
}
export function erroDemo(mensagem, status = 409) {
  const erro = new Error(mensagem);
  erro.response = { status, data: { error: mensagem } };
  return erro;
}
export function reservarLocal(dadosReserva, ocupadosApi = []) {
  const dados = lerGestor();
  const quadra = quadraLocal(dadosReserva.quadraId);
  if (!quadra) return null;
  const item = {
    id: `gestor-${idNovo()}`,
    quadraId: quadra.id,
    data: dadosReserva.data,
    inicio: dadosReserva.horario,
    fim: horaTexto(horaNumero(dadosReserva.horario) + 1),
    tipo: 'avulsa',
    cliente: dadosReserva.nomeCliente,
    telefone: dadosReserva.telefoneCliente,
    origem: 'QuadraFácil',
    metodo: 'online',
    pagamento: 'pendente',
    status: 'pendente',
    valor: cotarHorario(quadra, dadosReserva.data, dadosReserva.horario).valor,
  };
  if (
    !gradeLocal(quadra, item.data, ocupadosApi).horariosLivres.includes(item.inicio) ||
    conflito(eventosNoPeriodo(dados, item.data, item.data), item)
  )
    throw erroDemo('Este horário não está disponível.');
  salvarGestor({ ...dados, eventos: [...dados.eventos, item] });
  return { id: item.id, ...dadosReserva, status: 'pendente', valorTotal: item.valor };
}
export function pagarLocal(reservaId, metodo) {
  const dados = lerGestor();
  const evento = dados?.eventos.find((e) => e.id === reservaId);
  if (!evento) return null;
  if (evento.status === 'cancelada') throw erroDemo('A reserva foi cancelada.');
  salvarGestor({
    ...dados,
    eventos: dados.eventos.map((e) =>
      e.id === reservaId ? { ...e, pagamento: 'pago', status: 'confirmada', metodo } : e
    ),
  });
  return {
    id: `pagamento-${reservaId}`,
    reservaId,
    metodo,
    valor: evento.valor,
    status: 'aprovado',
  };
}
