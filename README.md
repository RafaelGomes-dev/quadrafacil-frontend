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
Comandos para rodar localmente
# ambiente de desenvolvimento (http://localhost:5173)
npm run dev

# build de produção
npm run build

# pré-visualização do build de produção
npm run preview

# lint
npm run lint
A QuadraFacil API precisa estar rodando em http://localhost:3001 (ou na URL
configurada em VITE_API_URL) para que as páginas que consomem dados funcionem.

Variáveis de ambiente
Copie .env.example para .env:
Variável	Descrição	Valor padrão
VITE_API_URL	URL base da QuadraFacil API	http://localhost:3001/api


Atenção ao prefixo: o enunciado da disciplina usa REACT_APP_ porque foi escrito pensando no
Create React App (CRA). Este projeto usa Vite, e o Vite só expõe ao código do navegador variáveis
de ambiente cujo nome começa com VITE_ — por isso usamos VITE_API_URL em vez de REACT_APP_API_URL.
Isso é lido em src/services/api.js via import.meta.env.VITE_API_URL.
Estrutura de pastas
quadrafacil-frontend/
├── index.html                  → ponto de entrada HTML carregado pelo Vite
├── src/
│   ├── main.jsx                → monta o React e importa os estilos globais
│   ├── App.jsx                 → BrowserRouter com todas as rotas
│   ├── components/             → componentes compartilhados
│   │   ├── Header.jsx, Footer.jsx, Navigation.jsx
│   │   ├── APITest.jsx         → mostra se a API está online
│   │   ├── QuadraCard.jsx      → card de resumo de uma quadra
│   │   ├── FiltroBusca.jsx     → formulário de busca e filtros
│   │   ├── SeletorHorario.jsx  → grade de horários livres e ocupados
│   │   └── common/             → Button, Card e LoadingSpinner
│   ├── pages/                  → uma página por rota
│   ├── services/               → chamadas HTTP e integração com a API
│   │   ├── api.js
│   │   ├── quadraService.js
│   │   ├── reservaService.js
│   │   └── pagamentoService.js
│   └── styles/
│       ├── variables.css       → tokens de cor, espaçamento e tipografia
│       ├── globals.css         → estilos globais
│       └── App.css             → layout e estilos responsivos
├── .env.example                → modelo de variáveis de ambiente
├── .env                        → variáveis locais, não versionadas
└── .prettierrc                 → regras de formatação
Rotas da aplicação
Rota	Página	Descrição
/	Home	Busca rápida, destaques e status da API
/quadras	Quadras	Listagem de quadras com filtros
/quadras/:id	QuadraDetalhe	Perfil da quadra e horários
/reserva	Reserva	Dados do cliente, pagamento e confirmação
/painel-gestor	PainelGestor	Reservas, status e cancelamentos
/cadastrar-quadra	CadastrarQuadra	Formulário de cadastro de quadra
/sobre	About	Informações sobre o projeto
/contato	Contact	Formulário de contato demonstrativo
*	NotFound	Página 404


Protótipo de baixa fidelidade
Fotos das telas desenhadas à mão:
- Link para as imagens: [COLE AQUI O LINK COMPARTILHÁVEL]
- Senha de acesso, se necessária: [NÃO COLOQUE UMA SENHA REAL NESTE README PÚBLICO]
Este repositório é público. Compartilhe qualquer senha necessária separadamente, por um canal privado. Se possível, configure o Drive como “Qualquer pessoa com o link — Leitor” para não exigir senha.

Fluxo de branches e padrão de commits
- main: código estável, pronto para entrega.
- develop: integração das features antes de irem para main.
- feat/<nome-da-feature>, style/<assunto> e docs/<assunto>: branches criadas a partir de develop e enviadas de volta por Pull Request.
Commits seguem Conventional Commits em português:
feat: adiciona página de listagem de quadras
fix: corrige filtro de preço mínimo
docs: atualiza README com variáveis de ambiente
style: ajusta responsividade do menu mobile
refactor: extrai lógica de busca para quadraService
Equipe
Nome	Função	GitHub
[PREENCHER]	[PREENCHER]	[PREENCHER]
[PREENCHER]	[PREENCHER]	[PREENCHER]
[PREENCHER]	[PREENCHER]	[PREENCHER]
