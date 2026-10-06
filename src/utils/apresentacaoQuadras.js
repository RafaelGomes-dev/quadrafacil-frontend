const FOTOS_POR_ESPORTE = {
  society: '/images/society.jpg',
  futsal: '/images/futsal.jpg',
  campo: '/images/campo.jpg',
  'beach tennis': '/images/beach-tennis.jpg',
  basquete: '/images/basquete.jpg',
  volei: '/images/volei.jpg',
};

const ROTULOS_POR_ESPORTE = {
  society: 'Futebol society',
  futsal: 'Futsal',
  campo: 'Campo de futebol',
  'beach tennis': 'Beach tennis',
  basquete: 'Basquete',
  volei: 'Vôlei',
};

const QUADRAS_PATROCINADAS = new Set([1, 2]);

export function fotoDaQuadra(quadra) {
  const fotoCadastrada = quadra.fotos?.find((foto) => !foto.includes('picsum.photos'));
  return fotoCadastrada || FOTOS_POR_ESPORTE[quadra.esporte] || '/images/society.jpg';
}

export function rotuloDoEsporte(esporte) {
  return ROTULOS_POR_ESPORTE[esporte] || esporte;
}

export function quadraPatrocinada(quadra) {
  return QUADRAS_PATROCINADAS.has(Number(quadra.id));
}

export function ordenarQuadras(quadras) {
  return [...quadras].sort(
    (primeira, segunda) => Number(quadraPatrocinada(segunda)) - Number(quadraPatrocinada(primeira))
  );
}
