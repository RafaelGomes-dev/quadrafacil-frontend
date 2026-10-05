# QuadraFacil — Frontend

Frontend do **QuadraFacil**, um "Airbnb de quadras esportivas": conecta jogadores e organizadores que querem reservar quadras de society, futsal, campo, vôlei, beach tennis e basquete aos gestores que administram agendas e pagamentos.

## Descrição do projeto

Esta interface React consome a [QuadraFacil API](../quadrafacil-api) e permite que:

- Jogadores busquem quadras por cidade, bairro, esporte, preço, data e horário, consultem detalhes e disponibilidade, façam reservas e usem o pagamento simulado.
- Gestores cadastrem quadras, acompanhem reservas e pagamentos e cancelem reservas.

## Tecnologias

- React 19 e Vite
- JavaScript
- React Router
- Axios
- CSS mobile-first
- Oxlint

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior

## Instalação

```bash
npm install
Executar localmente
npm run dev
O frontend será iniciado em http://localhost:5173.
Para gerar e visualizar o build de produção:
npm run build
npm run preview
Para executar o lint:
npm run lint
A QuadraFacil API também precisa estar rodando em http://localhost:3001.
Variáveis de ambiente
Copie .env.example para .env:
VITE_API_URL=http://localhost:3001/api
O projeto usa Vite, por isso a variável começa com VITE_. O prefixo REACT_APP_ é usado em projetos Create React App.
Estrutura de pastas
quadrafacil-frontend/
├── index.html
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── APITest.jsx
│   │   ├── FiltroBusca.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   ├── QuadraCard.jsx
│   │   └── SeletorHorario.jsx
│   ├── pages/
│   ├── services/
│   │   ├── api.js
│   │   ├── quadraService.js
│   │   ├── reservaService.js
│   │   └── pagamentoService.js
│   ├── styles/
│   │   ├── variables.css
│   │   ├── globals.css
│   │   └── App.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
└── README.md
Páginas e rotas
Rota	Página	Descrição
/	Home	Busca rápida, quadras em destaque e status da API
/quadras	Quadras	Listagem de quadras com filtros
/quadras/:id	Detalhes da quadra	Informações e horários disponíveis
/reserva	Reserva	Dados do cliente, pagamento e confirmação
/painel-gestor	Painel do gestor	Reservas, status e cancelamentos
/cadastrar-quadra	Cadastro de quadra	Formulário para cadastrar uma quadra
/sobre	Sobre	Informações sobre o projeto
/contato	Contato	Formulário demonstrativo de contato
*	Página não encontrada	Página 404


Protótipo de baixa fidelidade
Fotos das telas desenhadas à mão:
- Link para as imagens: [COLE AQUI O LINK COMPARTILHÁVEL]
- Senha, se necessária: [NÃO COLOQUE A SENHA REAL NESTE README PÚBLICO]
Este repositório é público. Envie qualquer senha necessária separadamente para a equipe e o professor por um canal privado. Se possível, configure o Drive como “Qualquer pessoa com o link — Leitor”.
Branches e commits
- main: versão estável do projeto.
- develop: integração das alterações da equipe.
- Crie branches de funcionalidade a partir de develop e envie Pull Requests de volta para develop.
Use mensagens de commit descritivas, seguindo Conventional Commits:
feat: adiciona página de listagem de quadras
fix: corrige filtro de preço mínimo
docs: atualiza README
style: ajusta responsividade do menu mobile
refactor: extrai lógica de busca para quadraService
Equipe
Nome	Função	GitHub
[PREENCHER]	[PREENCHER]	[PREENCHER]
[PREENCHER]	[PREENCHER]	[PREENCHER]
[PREENCHER]	[PREENCHER]	[PREENCHER]
```
