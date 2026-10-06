export function filtrosDaBusca(parametros) {
  const filtros = Object.fromEntries(new URLSearchParams(parametros));
  return { ...filtros, esporte: filtros.esporte === undefined ? 'society' : filtros.esporte };
}
export function compativel(q, f, grade) {
  const preco = Number(q.precoBuscado ?? q.precoHora);
  return (
    (!f.esporte || q.esporte === f.esporte) &&
    (!f.coberta || String(Boolean(q.estrutura?.coberta)) === f.coberta) &&
    (!f.bairro || q.bairro?.toLowerCase().includes(f.bairro.toLowerCase())) &&
    (!f.cidade || q.cidade?.toLowerCase().includes(f.cidade.toLowerCase())) &&
    (f.precoMin === undefined || f.precoMin === '' || preco >= Number(f.precoMin)) &&
    (f.precoMax === undefined || f.precoMax === '' || preco <= Number(f.precoMax)) &&
    (!grade || !f.horario || grade.horariosLivres.includes(f.horario))
  );
}
export function agruparEstabelecimentos(quadras) {
  const grupos = new Map();
  quadras.forEach((q) => {
    const id = String(q.estabelecimentoId || `quadra-${q.id}`);
    if (!grupos.has(id))
      grupos.set(id, { ...q, id, nome: q.estabelecimentoNome || q.nome, quadras: [] });
    grupos.get(id).quadras.push(q);
  });
  return [...grupos.values()];
}
export function precosPorModalidade(quadras) {
  const grupos = new Map();
  quadras.forEach((q) => {
    const preco = Number(q.precoBuscado ?? q.precoHora);
    const grupo = grupos.get(q.esporte) || { esporte: q.esporte, min: Infinity, max: 0 };
    grupo.min = Math.min(grupo.min, preco);
    grupo.max = Math.max(grupo.max, preco);
    grupos.set(q.esporte, grupo);
  });
  return [...grupos.values()];
}
