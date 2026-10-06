import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAVE_INTERESSES, registrarInteresse } from '../src/utils/interesses.js';
const storage = () => {
  const dados = new Map();
  return { getItem: (k) => dados.get(k), setItem: (k, v) => dados.set(k, v) };
};
const base = {
  tipo: 'espera',
  quadraId: '1',
  data: '2026-10-19',
  horario: '17:00',
  contato: ' Pessoa@Email.com ',
};
test('lista de espera persiste localmente e evita duplicação do mesmo contato e vaga', () => {
  const s = storage();
  assert.equal(registrarInteresse(base, s).duplicado, false);
  assert.equal(registrarInteresse({ ...base, contato: 'pessoa@email.com' }, s).duplicado, true);
  assert.equal(JSON.parse(s.getItem(CHAVE_INTERESSES)).length, 1);
});
test('quadras e horários distintos não compartilham a inscrição', () => {
  const s = storage();
  registrarInteresse(base, s);
  assert.equal(registrarInteresse({ ...base, quadraId: '2' }, s).duplicado, false);
  assert.equal(registrarInteresse({ ...base, horario: '18:00' }, s).duplicado, false);
});
test('mensalistas são interesses separados, não reservas', () => {
  const s = storage();
  registrarInteresse(base, s);
  assert.equal(
    registrarInteresse({ ...base, tipo: 'mensalista', diaSemana: '4' }, s).duplicado,
    false
  );
});
test('recupera armazenamento inválido e rejeita interesse sem contato', () => {
  const s = storage();
  s.setItem(CHAVE_INTERESSES, 'null');
  assert.equal(registrarInteresse(base, s).duplicado, false);
  assert.throws(() => registrarInteresse({ ...base, contato: '' }, s));
});
