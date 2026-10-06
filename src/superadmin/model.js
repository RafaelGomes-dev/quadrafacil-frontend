export const ADMIN_STORAGE_KEY = 'quadrafacil-superadmin-v1';
export const CONTA_DEMO_ID = 'gestor-arena-batel';

export function contasIniciais() {
  return {
    contas: [
      {
        id: CONTA_DEMO_ID,
        nome: 'Gestor Curitiba',
        email: 'gestor@arenabatel.example',
        estabelecimento: 'Arena Batel',
        limite: 4,
        quadras: 3,
        status: 'ativa',
        plano: 'premium',
        patrocinado: true,
      },
      {
        id: 'gestor-cic',
        nome: 'Marina Alves',
        email: 'marina@arenacic.example',
        estabelecimento: 'Arena Cidade Industrial',
        limite: 1,
        quadras: 1,
        status: 'ativa',
        plano: 'freemium',
        patrocinado: false,
      },
      {
        id: 'gestor-campo',
        nome: 'Lucas Martins',
        email: 'lucas@campobacacheri.example',
        estabelecimento: 'Campo do Bacacheri',
        limite: 2,
        quadras: 1,
        status: 'revogada',
        plano: 'pro',
        patrocinado: false,
        motivo: 'Exemplo de acesso revogado pela equipe',
      },
      ...GESTORES_ADICIONAIS.map((c) => ({ ...c })),
    ],
    versaoExemplos: 2,
    historico: [],
  };
}
export function validarConta(form, contas, ignorarId) {
  if (form.plano && !['freemium', 'pro', 'premium'].includes(form.plano))
    return 'Selecione um plano válido.';
  if (form.nome.trim().length < 3 || !form.estabelecimento.trim())
    return 'Preencha o nome do gestor e do estabelecimento.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Informe um e-mail válido.';
  if (!Number.isInteger(Number(form.limite)) || Number(form.limite) < 1 || Number(form.limite) > 50)
    return 'O limite deve ser um número inteiro entre 1 e 50.';
  if (
    contas.some(
      (c) => c.id !== ignorarId && c.email.toLowerCase() === form.email.trim().toLowerCase()
    )
  )
    return 'Já existe um gestor com esse e-mail.';
  return '';
}
export function alterarAcesso(dados, id, status, motivo, registro) {
  if (!['ativa', 'revogada'].includes(status)) throw new Error('Status inválido.');
  if (status === 'revogada' && !motivo.trim()) throw new Error('Informe o motivo da revogação.');
  if (!dados.contas.some((c) => c.id === id)) throw new Error('Conta não encontrada.');
  return {
    ...dados,
    contas: dados.contas.map((c) =>
      c.id === id ? { ...c, status, motivo: status === 'revogada' ? motivo.trim() : '' } : c
    ),
    historico: [registro, ...dados.historico].slice(0, 20),
  };
}
export function lerAdmin() {
  try {
    const dados = completarExemplos(
      JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY)) || contasIniciais()
    );
    const iniciais = contasIniciais().contas;
    return {
      ...dados,
      contas: dados.contas.map((c) => {
        const exemplo = iniciais.find((i) => i.id === c.id);
        return {
          ...c,
          plano: c.plano ?? exemplo?.plano ?? 'freemium',
          patrocinado: c.patrocinado ?? exemplo?.patrocinado ?? false,
        };
      }),
    };
  } catch {
    return contasIniciais();
  }
}
export function completarExemplos(dados) {
  if (dados.versaoExemplos === 2) return dados;
  return {
    ...dados,
    versaoExemplos: 2,
    contas: [
      ...dados.contas,
      ...GESTORES_ADICIONAIS.filter((c) => !dados.contas.some((atual) => atual.id === c.id)).map(
        (c) => ({ ...c })
      ),
    ],
  };
}
export function salvarAdmin(dados) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(dados));
  window.dispatchEvent(new Event('quadrafacil-admin'));
}
export function contaDemo() {
  return lerAdmin().contas.find((c) => c.id === CONTA_DEMO_ID);
}
export function podeCadastrarQuadra(conta, quantidade) {
  return Boolean(conta?.status === 'ativa' && quantidade < Number(conta.limite));
}
import { GESTORES_ADICIONAIS } from './exemplos.js';
