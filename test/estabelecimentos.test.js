import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filtrosDaBusca,
  compativel,
  agruparEstabelecimentos,
  precosPorModalidade,
} from '../src/utils/estabelecimentos.js';
const quadras = [
  {
    id: 1,
    estabelecimentoId: 'arena',
    esporte: 'society',
    precoHora: 180,
    estrutura: { coberta: false },
  },
  {
    id: 2,
    estabelecimentoId: 'arena',
    esporte: 'beach tennis',
    precoHora: 60,
    estrutura: { coberta: true },
  },
];
test('society é padrão, mas todos os esportes é uma escolha explícita', () => {
  assert.equal(filtrosDaBusca('').esporte, 'society');
  assert.equal(filtrosDaBusca('esporte=').esporte, '');
});
test('todos os filtros são atendidos pela mesma quadra', () => {
  assert.equal(
    quadras.some((q) => compativel(q, { esporte: 'society', coberta: 'true' })),
    false
  );
  assert.equal(compativel(quadras[0], { horario: '14:00' }, { horariosLivres: ['15:00'] }), false);
  assert.equal(compativel(quadras[0], { precoMax: '0' }), false);
});
test('um estabelecimento agrupa espaços sem misturar preços de modalidades', () => {
  assert.equal(agruparEstabelecimentos(quadras).length, 1);
  assert.deepEqual(
    precosPorModalidade(quadras).map((p) => p.min),
    [180, 60]
  );
});
