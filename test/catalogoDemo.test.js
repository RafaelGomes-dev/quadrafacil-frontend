import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GESTORES_ADICIONAIS } from '../src/superadmin/exemplos.js';
import {
  gerarQuadrasCatalogo,
  gradeCatalogo,
  reservarCatalogo,
  pagarCatalogo,
} from '../src/services/catalogoDemo.js';
const storage = () => {
  const dados = new Map();
  return { getItem: (k) => dados.get(k), setItem: (k, v) => dados.set(k, v) };
};
test('publica os 12 estabelecimentos de exemplo sem misturar suas quadras', () => {
  const quadras = gerarQuadrasCatalogo(GESTORES_ADICIONAIS);
  assert.equal(new Set(quadras.map((q) => q.estabelecimentoId)).size, 12);
  assert.equal(quadras.length, 16);
  assert.equal(new Set(quadras.map((q) => q.id)).size, 16);
  assert.ok(quadras.every((q) => q.esporte === 'society'));
  assert.equal(quadras.filter((q) => q.estabelecimentoNome === 'Arena Cabral').length, 3);
});
test('não publica espaços de gestores revogados', () => {
  assert.equal(gerarQuadrasCatalogo([{ ...GESTORES_ADICIONAIS[0], status: 'revogada' }]).length, 0);
});
test('revogar um gestor não muda bairro, preço ou cobertura das outras quadras', () => {
  const inicial = gerarQuadrasCatalogo(GESTORES_ADICIONAIS);
  const atualizado = gerarQuadrasCatalogo(
    GESTORES_ADICIONAIS.map((c, i) => (i === 0 ? { ...c, status: 'revogada' } : c))
  );
  assert.deepEqual(
    atualizado,
    inicial.filter((q) => q.estabelecimentoId !== 'catalogo-demo-ana')
  );
});
test('reserva e pagamento mock do catálogo preservam horário e valor sem afetar outra quadra', () => {
  const s = storage();
  const q = gerarQuadrasCatalogo(GESTORES_ADICIONAIS)[0];
  const dados = {
    quadraId: q.id,
    data: '2026-10-19',
    horario: '19:00',
    nomeCliente: 'Pessoa Teste',
  };
  const r = reservarCatalogo(dados, q, s);
  assert.equal(pagarCatalogo(r.id, 'pix', s).valor, q.precoHora);
  assert.ok(gradeCatalogo(q.id, dados.data, s).horariosOcupados.includes('19:00'));
  assert.ok(gradeCatalogo('outra', dados.data, s).horariosLivres.includes('19:00'));
  assert.throws(() => reservarCatalogo(dados, q, s));
});
