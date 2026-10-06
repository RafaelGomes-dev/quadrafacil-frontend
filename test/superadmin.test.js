import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contasIniciais,
  validarConta,
  alterarAcesso,
  CONTA_DEMO_ID,
  podeCadastrarQuadra,
  completarExemplos,
  normalizarPlano,
  PLANOS_GESTOR,
  lerAdmin,
  ADMIN_STORAGE_KEY,
} from '../src/superadmin/model.js';
test('planos da interface são apenas Free e Crescimento; cadastro não oferece Pro antigo', () => {
  assert.deepEqual(Object.values(PLANOS_GESTOR), ['Free', 'Crescimento']);
  assert.equal(normalizarPlano('pro'), 'premium');
  assert.equal(normalizarPlano('premium'), 'premium');
  assert.equal(normalizarPlano('freemium'), 'freemium');
  const contas = contasIniciais().contas;
  assert.ok(contas.every((c) => Object.hasOwn(PLANOS_GESTOR, c.plano)));
  assert.match(validarConta({ ...contas[0], plano: 'pro' }, contas, contas[0].id), /plano válido/);
});
test('leitura migra planos antigos sem perder configurações, contas ou histórico salvo', (t) => {
  const dados = contasIniciais();
  dados.contas[0] = {
    ...dados.contas[0],
    nome: 'Nome personalizado',
    plano: 'pro',
    limite: 8,
    patrocinado: false,
  };
  dados.financeiro = { proposta: { crescimento: 60000 } };
  dados.historico = [{ acao: 'Edição anterior' }];
  const salvo = JSON.stringify(dados);
  const anterior = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key) => (key === ADMIN_STORAGE_KEY ? salvo : null) },
  });
  t.after(() => {
    if (anterior) Object.defineProperty(globalThis, 'localStorage', anterior);
    else delete globalThis.localStorage;
  });
  const lido = lerAdmin();
  assert.equal(lido.contas[0].plano, 'premium');
  assert.equal(lido.contas[0].nome, 'Nome personalizado');
  assert.equal(lido.contas[0].limite, 8);
  assert.equal(lido.contas[0].patrocinado, false);
  assert.equal(lido.contas.length, dados.contas.length);
  assert.deepEqual(lido.financeiro, dados.financeiro);
  assert.deepEqual(lido.historico, dados.historico);
  assert.equal(dados.contas[0].plano, 'pro');
});
test('novos exemplos complementam dados antigos sem substituir edições e sem duplicar', () => {
  const antiga = {
    contas: [{ id: CONTA_DEMO_ID, nome: 'Nome editado', status: 'revogada' }],
    historico: [{ acao: 'teste' }],
  };
  const migrada = completarExemplos(antiga);
  assert.equal(migrada.contas.length, 13);
  assert.equal(migrada.contas[0].nome, 'Nome editado');
  assert.equal(migrada.contas[0].status, 'revogada');
  assert.deepEqual(migrada.historico, antiga.historico);
  assert.equal(completarExemplos(migrada).contas.length, 13);
  assert.equal(contasIniciais().contas.length, 15);
});
test('cadastro valida identificação, e-mail único e limite inteiro', () => {
  const contas = contasIniciais().contas;
  const form = {
    nome: 'Novo Gestor',
    email: 'novo@exemplo.test',
    estabelecimento: 'Nova Arena',
    limite: 2,
  };
  assert.equal(validarConta(form, contas), '');
  assert.match(
    validarConta({ ...form, email: contas[0].email.toUpperCase() }, contas),
    /Já existe/
  );
  assert.match(validarConta({ ...form, limite: 0 }, contas), /limite/);
  assert.match(validarConta({ ...form, limite: 1.5 }, contas), /inteiro/);
  assert.equal(validarConta(contas[0], contas, contas[0].id), '');
});
test('revogação exige motivo, mantém dados e permite reativação', () => {
  const dados = contasIniciais();
  assert.throws(() => alterarAcesso(dados, CONTA_DEMO_ID, 'revogada', '', {}), /motivo/);
  const revogada = alterarAcesso(dados, CONTA_DEMO_ID, 'revogada', 'Solicitação do responsável', {
    acao: 'Revogação',
  });
  assert.equal(revogada.contas[0].status, 'revogada');
  assert.equal(revogada.contas[0].quadras, dados.contas[0].quadras);
  assert.equal(dados.contas[0].status, 'ativa');
  assert.equal(alterarAcesso(revogada, CONTA_DEMO_ID, 'ativa', '', {}).contas[0].motivo, '');
});
test('limites impedem novas quadras sem excluir as existentes', () => {
  assert.equal(podeCadastrarQuadra({ status: 'ativa', limite: 2 }, 1), true);
  assert.equal(podeCadastrarQuadra({ status: 'ativa', limite: 2 }, 2), false);
  assert.equal(podeCadastrarQuadra({ status: 'ativa', limite: 2 }, 3), false);
  assert.equal(podeCadastrarQuadra({ status: 'revogada', limite: 4 }, 1), false);
});
