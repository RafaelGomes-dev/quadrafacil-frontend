# QuadraFacil — Frontend

Frontend do **QuadraFacil**, um "Airbnb de quadras esportivas": conecta jogadores/organizadores que
querem reservar uma quadra (society, futsal, campo, vôlei, beach tennis, basquete) a gestores/proprietários
que administram a agenda e os pagamentos dessas quadras.

## Descrição do projeto

Esta interface React consome a [QuadraFacil API](../quadrafacil-api) e permite que:

- **Jogadores/organizadores** busquem quadras por cidade, bairro, esporte, preço, data e horário,
  vejam o perfil de cada quadra com sua estrutura (vestiário, estacionamento, iluminação, cobertura),
  escolham um horário livre, façam uma reserva e paguem (pagamento simulado nesta etapa).
- **Gestores/proprietários** cadastrem novas quadras e acompanhem as reservas e o status de pagamento
  em um painel, podendo cancelar reservas (o que libera o horário novamente).

## Stack utilizada

- React 19 + Vite (JavaScript puro, sem TypeScript)
- react-router-dom (roteamento)
- axios (chamadas HTTP)
- CSS puro, mobile-first, com tokens de design (`src/styles/variables.css`)
- oxlint (lint)

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior

## Instalação de dependências

```bash
npm install
```

## Comandos para rodar localmente

```bash
# ambiente de desenvolvimento (http://localhost:5173)
npm run dev

# build de produção
npm run build

# pré-visualização do build de produção
npm run preview

# lint
npm run lint
```

> A [QuadraFacil API](../quadrafacil-api) precisa estar rodando em `http://localhost:3001` (ou na URL
> configurada em `VITE_API_URL`) para que as páginas que consomem dados funcionem.

## Variáveis de ambiente

Copie `.env.example` para `.env`:

| Variável       | Descrição                         | Valor padrão                     |
| -------------- | ---------------------------------- | ---------------------------------- |
| `VITE_API_URL` | URL base da QuadraFacil API         | `http://localhost:3001/api`         |

**Atenção ao prefixo**: o enunciado da disciplina usa `REACT_APP_` porque foi escrito pensando no
Create React App (CRA). Este projeto usa **Vite**, e o Vite só expõe ao código do navegador variáveis
de ambiente cujo nome começa com `VITE_` — por isso usamos `VITE_API_URL` em vez de `REACT_APP_API_URL`.
Isso é lido em `src/services/api.js` via `import.meta.env.VITE_API_URL`.

## Estrutura de pastas

```
quadrafacil-frontend/
├── index.html                  → ponto de entrada HTML carregado pelo Vite
├── src/
│   ├── main.jsx                 → monta o React na div#root e importa os estilos globais
│   ├── App.jsx                  → BrowserRouter com todas as rotas da aplicação
│   ├── components/              → componentes compartilhados entre páginas
│   │   ├── Header.jsx, Footer.jsx, Navigation.jsx
│   │   ├── APITest.jsx          → mostra se a API está online (usado na Home)
│   │   ├── QuadraCard.jsx       → card de resumo de uma quadra
│   │   ├── FiltroBusca.jsx      → formulário de busca/filtros reutilizável
│   │   ├── SeletorHorario.jsx   → grade de horários livres/ocupados
│   │   └── common/              → Button, Card, LoadingSpinner (componentes genéricos de UI)
│   ├── pages/                   → uma página por rota (ver tabela de rotas abaixo)
│   ├── services/                → toda chamada HTTP fica aqui, fora dos componentes
│   │   ├── api.js                → instância axios com a baseURL da API
│   │   ├── quadraService.js      → busca, detalhe, horários e cadastro de quadras
│   │   ├── reservaService.js     → listagem, criação e cancelamento de reservas
│   │   └── pagamentoService.js   → processamento do pagamento simulado
│   └── styles/
│       ├── variables.css         → tokens de cor, espaçamento e tipografia
│       ├── globals.css           → reset e estilos base do documento
│       └── App.css               → estilos de layout e dos componentes, mobile-first
├── .env.example                   → modelo de variáveis de ambiente (versionado)
├── .env                           → variáveis reais (NÃO versionado)
└── .prettierrc                     → regras de formatação
```

## Rotas da aplicação

| Rota                | Página            | Descrição                                               |
| -------------------- | ----------------- | ---------------------------------------------------------- |
| `/`                  | Home               | Hero com busca rápida + quadras em destaque + status da API |
| `/quadras`           | Quadras            | Listagem com filtros completos                              |
| `/quadras/:id`       | QuadraDetalhe      | Perfil da quadra e grade de horários                         |
| `/reserva`           | Reserva            | Resumo, dados do cliente, pagamento (Pix/cartão) e confirmação |
| `/painel-gestor`     | PainelGestor       | Lista de reservas, status e cancelamento                     |
| `/cadastrar-quadra`  | CadastrarQuadra    | Formulário de cadastro de quadra                              |
| `/sobre`             | About              | Sobre o projeto                                                |
| `/contato`           | Contact            | Formulário de contato (mock)                                   |
| `*`                  | NotFound           | Página 404                                                     |

## Fluxo de branches e padrão de commits

- `main`: código estável, pronto para entrega.
- `develop`: integração das features antes de ir para `main`.
- `feat/<nome-da-feature>`, `style/<assunto>`, `docs/<assunto>`: branches de trabalho, sempre a partir
  de `develop`, mescladas de volta com `merge --no-ff`.

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/) em português:

```
feat: adiciona página de listagem de quadras
fix: corrige filtro de preço mínimo
docs: atualiza README com variáveis de ambiente
style: ajusta responsividade do menu mobile
refactor: extrai lógica de busca para quadraService
```

## Equipe

| Nome        | Função          | GitHub        |
| ----------- | --------------- | ------------- |
| [PREENCHER] | [PREENCHER]      | [PREENCHER]    |
| [PREENCHER] | [PREENCHER]      | [PREENCHER]    |
| [PREENCHER] | [PREENCHER]      | [PREENCHER]    |
