import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contasIniciais,
  validarConta,
  alterarAcesso,
  CONTA_DEMO_ID,
} from '../src/superadmin/model.js';
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
