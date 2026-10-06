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
```

## Executar localmente

```bash
npm run dev
```

O frontend será iniciado em `http://localhost:5173`.

Para gerar e visualizar o build de produção:

```bash
npm run build
npm run preview
```

Para executar o lint:

```bash
npm run lint
```

A [QuadraFacil API](../quadrafacil-api) também precisa estar rodando em `http://localhost:3001`.

## Variáveis de ambiente

Copie `.env.example` para `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

O projeto usa Vite, por isso a variável começa com `VITE_`. O prefixo `REACT_APP_` é usado em projetos Create React App.

## Estrutura de pastas

```text
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
│   ├── layouts/
│   │   └── AreaLayout.jsx
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
```

## Páginas e rotas

| Área    | Rota                    | Página                                                    |
| ------- | ----------------------- | --------------------------------------------------------- |
| Jogador | `/user`                 | Início e busca rápida                                     |
| Jogador | `/user/quadras`         | Listagem com filtros                                      |
| Jogador | `/user/quadras/:id`     | Detalhes e horários                                       |
| Jogador | `/user/reserva`         | Reserva e pagamento simulado                              |
| Jogador | `/user/sobre`           | Sobre o projeto                                           |
| Jogador | `/user/contato`         | Contato demonstrativo                                     |
| Gestor  | `/gestor`               | Dashboard com métricas e agenda                           |
| Gestor  | `/gestor/agenda`        | Agenda diária e semanal por quadra                        |
| Gestor  | `/gestor/reservas`      | Busca, detalhes e cancelamento de reservas                |
| Gestor  | `/gestor/financeiro`    | Receita, comissão, pendências, repasses e extrato fictício |
| Gestor  | `/gestor/inteligencia`  | Histórico de ocupação e insights demonstrativos · planos pagos |
| Gestor  | `/gestor/configuracoes` | Quadras, preços, promoções, mensalistas e estabelecimento |
| Equipe  | `/superadmin`           | Contas de gestores e financeiro demonstrativo da plataforma |

`/` redireciona para `/user`. Os endereços anteriores redirecionam para as novas rotas.
Cada área tem seu próprio menu e o mesmo rodapé institucional. A barra superior
**DEMO** reúne a troca entre Jogador, Gestor e Superadmin: é um controle temporário,
fora da navegação do produto, a remover na versão final. As rotas não possuem
autenticação nesta versão do protótipo.

### Inteligência e financeiro do gestor

A Inteligência é uma simulação de benefício dos planos Pro/Premium; Freemium recebe
uma prévia. O plano do gestor de exemplo pode ser alterado no Superadmin. Há mapa de
ocupação por dia/hora, filtros por quadra e 4/8 semanas, detalhe por célula, ranking
e oportunidades de promoção. A capacidade considera o funcionamento e as quadras
ativas. O histórico é sintético, independente da agenda: não há IA ou previsão real.
Lista de espera aparece apenas como conceito para a próxima fase.

O Financeiro tem lançamentos fictícios do mês, filtros por período, quadra, origem e
pagamento, gráfico, extrato e detalhes. Mensalidades aparecem uma vez por mês. Comissão
de 10% somente nas reservas avulsas da plataforma, sem descontar gateway novamente do
gestor. Recebido direto, repassado, pagamento pendente e repasse previsto são distintos.
Canceladas/reembolsadas não entram nos totais. Não há documento fiscal, movimentação
bancária, cálculo tributário ou sincronização desse extrato com a agenda.

### Administração interna

`/superadmin` permite à equipe criar e editar contas fictícias de gestores, definir
limites de quadras, revogar acesso com motivo e reativá-lo. As ações são salvas neste
navegador e aparecem em um histórico local. Não há cadastro público, senhas ou envio
de convites. A conta Arena Batel está vinculada ao painel de exemplo: sua revogação
exibe um aviso no gestor, e seu limite impede novos cadastros de quadras.
Contas novas são registros demonstrativos; não criam ambientes de gestão separados.
A rota não é protegida: restringi-la de verdade à equipe depende de autenticação e
autorização no backend, fora deste MVP. Revogar preserva quadras e reservas existentes.

O painel também mostra planos Freemium/Pro/Premium e patrocínios das contas ativas.
Os nomes dos planos são demonstrativos; plano e destaque podem ser editados sem
cobrança real. O patrocínio é independente do plano e não altera o ranking do jogador.
O financeiro usa uma base fictícia de outubro de 2026, independente da agenda, com
filtros Hoje/Últimos 7 dias/Este mês. Valores são calculados em centavos: comissão de
10% por transação paga ou pendente, excluindo canceladas e reembolsadas. Volume bruto
não é receita da plataforma, e pagamento confirmado não significa repasse recebido.
Na aba **Financeiro**, a recorrência mensal dos planos e patrocínios é apresentada
separadamente das reservas do período. Hipóteses editáveis: Pro R$ 99/mês, Premium
R$ 199/mês, patrocínio R$ 49/mês e gateway 3%. Não são preços ou taxas de mercado.
O gateway incide no valor total da reserva e é descontado da comissão bruta de 10%
para calcular o líquido; não inclui tributos nem outros custos. Pagamentos pendentes
entram somente na previsão. Planos e patrocínios mostram projeção bruta, sem simular
liquidação ou taxas de cobrança. Reservas manuais e mensalistas não geram comissão
nesta demonstração. Há 15 gestores iniciais fictícios (cadastros locais adicionais
são preservados); seus espaços são registros administrativos, não novas quadras na
busca do jogador. Exemplos complementam a base antiga sem substituir edições.

### Demonstração do gestor

O MVP começa com **Society** selecionado. A busca mostra um card por estabelecimento,
com preços separados por modalidade quando todos os esportes forem selecionados.
Modalidade, cobertura, disponibilidade e preço são verificados na mesma quadra.
O detalhe preserva os filtros da busca e exibe somente os espaços compatíveis.
O jogador pode combinar horários em diferentes quadras do mesmo estabelecimento;
a confirmação agrupa somente horários consecutivos da mesma quadra e data.
O exemplo Arena Batel possui duas quadras de Society e uma de Beach tennis.
Endereço e contato são compartilhados; características, horários e preços pertencem
a cada quadra. Com um único espaço ativo, o filtro da agenda deixa de aparecer.

O painel usa dados fictícios e salva as alterações em `localStorage` neste navegador.
Reservas manuais, bloqueios e mensalistas ocupam a agenda; preços por data têm prioridade
sobre regras semanais e o preço padrão. Reservas novas preservam o valor contratado.
O fluxo do jogador no mesmo navegador considera essas alterações e promoções.
As reservas da API mock também aparecem no painel para as quadras administradas.
Ainda não há banco, autenticação, cobrança ou reembolso real. A receita do período
considera reservas avulsas; mensalidades são mostradas separadamente, sem contabilizar
o valor mensal a cada ocorrência da agenda.

## Protótipo

As fotos do protótipo desenhado à mão estão na pasta \Protótipo_QF/`.`

## Branches e commits

- `main`: versão estável do projeto.
- `develop`: integração das alterações da equipe.
- Crie branches de funcionalidade a partir de `develop` e envie Pull Requests de volta para `develop`.

Use mensagens de commit descritivas, seguindo Conventional Commits:

```text
feat: adiciona página de listagem de quadras
fix: corrige filtro de preço mínimo
docs: atualiza README
style: ajusta responsividade do menu mobile
refactor: extrai lógica de busca para quadraService
```

## Equipe

| Nome             | Função                                                       | GitHub           |
| ---------------- | ------------------------------------------------------------ | ---------------- |
| Rafael Gomes     | Front-end, roteamento, integração com a API e responsividade | RafaelGomes-dev  |
| Rafael Maluf     | Organização do Trello, validações e testes                   | RafaMaluf        |
| Henry Mendes     | Protótipo e documentação                                     | HenryMendesr     |
| Tiago Dagnoluzzo | Testes e documentação                                        | tiago-dagnoluzzo |
| Erick Meister    | Documentação e ajustes de interface                          | Minimeister05    |
