# QuadraFácil — Frontend

Frontend do **QuadraFácil** — _Encontre. Reserve. Jogue._ Um marketplace de espaços esportivos, com áreas separadas para jogadores, gestores e equipe administradora. O escopo principal do MVP é **Society**; outras modalidades aparecem como exemplos.

## Descrição do projeto

Este é um **protótipo funcional de frontend**, com interface responsiva, integração com a [QuadraFácil API mock](https://github.com/RafaelGomes-dev/quadrafacil-api) e dados demonstrativos no navegador. Permite que:

- Jogadores busquem estabelecimentos, filtrem os espaços reserváveis, escolham vários horários e concluam um checkout simulado, além de registrar interesse em lista de espera ou mensalista.
- Gestores acompanhem dashboard e agenda diária/semanal, registrem reservas manuais e bloqueios, configurem quadras, preços e mensalistas e consultem financeiro e inteligência demonstrativos.
- A equipe crie contas fictícias de gestores, defina limites, revogue/reative acessos e simule receitas e custos da plataforma.

Não há autenticação, banco de dados, pagamento real, notificações ou proteção das rotas. A barra **DEMO** permite trocar de área durante a apresentação. Os planos atuais são **Free** e **Crescimento**, com patrocínio independente.

## Tecnologias

- React 19 e Vite
- JavaScript
- React Router
- Axios
- CSS mobile-first
- Oxlint

## Pré-requisitos

- Node.js **22.12 ou superior** recomendado. Vite 8 também aceita Node 20 a partir de 20.19; Node 18 não é compatível com esta versão do frontend.
- npm compatível com a versão do Node instalada.

## Instalação

```bash
npm ci
```

## Executar localmente

```bash
npm run dev
```

O frontend será iniciado em `http://localhost:5173` (se a porta estiver livre). Entradas da demonstração:

- Jogador: `http://localhost:5173/user`
- Gestor: `http://localhost:5173/gestor`
- Superadmin: `http://localhost:5173/superadmin` → abas Gestores e Financeiro.

Para gerar e visualizar o build de produção:

```bash
npm run build
npm run preview
```

Para executar os testes automatizados e o lint:

```bash
npm test
npm run lint
```

A [QuadraFácil API](https://github.com/RafaelGomes-dev/quadrafacil-api#readme) também precisa estar rodando em `http://localhost:3001` para a busca e os fluxos integrados. Em outro terminal, siga o README da API (`npm ci` e `npm run dev`, após configurar seu `.env`). As telas financeiras usam simulações próprias; isso não substitui a API nos demais fluxos.

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
├── public/
│   └── images/           # Logo e fotos demonstrativas
├── src/
│   ├── components/       # Busca, cards, diálogos, barra DEMO e rodapé compartilhado
│   ├── layouts/          # Layouts das áreas de jogador, gestor e superadmin
│   ├── pages/            # Páginas de jogador e entradas de gestor/superadmin
│   ├── gestor/           # Agenda, reservas, configurações, financeiro e inteligência
│   ├── superadmin/       # Contas e modelo financeiro demonstrativo
│   ├── services/         # API e integração dos dados locais de demonstração
│   ├── utils/            # Filtros, horários, formatação e validações
│   ├── styles/           # Estilos responsivos e identidade visual
│   ├── App.jsx           # Definição das rotas e redirecionamentos
│   └── main.jsx
├── test/                 # Testes automatizados com node:test
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Páginas e rotas

| Área    | Rota                    | Página                                                            |
| ------- | ----------------------- | ----------------------------------------------------------------- |
| Jogador | `/user`                 | Busca e listagem únicas, com horário nos filtros principais       |
| Jogador | `/user/quadras`         | Redirecionamento para `/user`, preservando a busca                |
| Jogador | `/user/quadras/:id`     | Detalhes e horários                                               |
| Jogador | `/user/reserva`         | Reserva e pagamento simulado                                      |
| Jogador | `/user/suporte`         | Formulário de atendimento demonstrativo                           |
| Gestor  | `/gestor`               | Dashboard com métricas e agenda                                   |
| Gestor  | `/gestor/agenda`        | Agenda diária e semanal por quadra                                |
| Gestor  | `/gestor/reservas`      | Busca, detalhes e cancelamento de reservas                        |
| Gestor  | `/gestor/financeiro`    | Receita das quadras, pendências e extrato fictício                |
| Gestor  | `/gestor/inteligencia`  | Histórico e insights demonstrativos · Crescimento; prévia no Free |
| Gestor  | `/gestor/configuracoes` | Quadras, preços, promoções, mensalistas e estabelecimento         |
| Equipe  | `/superadmin`           | Contas de gestores e financeiro demonstrativo da plataforma       |

As abas Gestores/Financeiro do superadmin compartilham `/superadmin`; não há uma rota separada `/superadmin/financeiro`. O checkout e sua confirmação também compartilham `/user/reserva`.

### Compatibilidade com links antigos

| Rota anterior                                | Destino atual                 |
| -------------------------------------------- | ----------------------------- |
| `/` e `/user/quadras`                        | `/user`                       |
| `/quadras`                                   | `/user` (via `/user/quadras`) |
| `/quadras/:id`                               | `/user/quadras/:id`           |
| `/reserva`                                   | `/user/reserva`               |
| `/sobre` e `/user/sobre`                     | `/user`                       |
| `/contato` e `/user/contato`                 | `/user/suporte`               |
| `/painel-gestor`                             | `/gestor`                     |
| `/cadastrar-quadra` e `/gestor/quadras/nova` | `/gestor/configuracoes`       |

Os redirecionamentos antigos preservam parâmetros de busca quando tratados por `LegacyRedirect`. URLs desconhecidas exibem a página 404 da área correspondente. Não existem telas próprias de login, cadastro público ou Minhas reservas neste MVP.

Cada área tem seu próprio menu e o mesmo rodapé institucional. A barra superior
**DEMO** reúne a troca entre Jogador, Gestor e Superadmin: é um controle temporário,
fora da navegação do produto, a remover na versão final. As rotas não possuem
autenticação nesta versão do protótipo.

### Inteligência e financeiro do gestor

A Inteligência é uma simulação de benefício do plano Crescimento; Free recebe
uma prévia. O plano do gestor de exemplo pode ser alterado no Superadmin. Há mapa de
ocupação por dia/hora, filtros por quadra e 4/8 semanas, detalhe por célula, ranking
e oportunidades de promoção. Sugestões ilustrativas de desconto de 20% ou reajuste
de 10% abrem uma prévia editável por quadra e uma regra semanal preenchida, que só
é aplicada após confirmação do gestor. A capacidade considera o funcionamento e as quadras
ativas. O histórico é sintético, independente da agenda: não há IA ou previsão real.
Lista de espera aparece apenas como conceito para a próxima fase.

O Financeiro tem lançamentos fictícios do mês, filtros por período, quadra, origem e
situação do pagamento, gráfico, extrato e detalhes. Mensalidades aparecem uma vez por mês. Comissão
de serviço não é descontada da receita do gestor nesta tela: a hipótese é cobrança
separada ao jogador, ainda não implementada no checkout. Não há comissão sobre
pagamentos presenciais simulados. Recebido direto, repassado, pagamento pendente e repasse previsto são distintos.
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

O painel também mostra planos Free/Crescimento e patrocínios das contas ativas.
Os nomes dos planos são demonstrativos; plano e destaque podem ser editados sem
cobrança real. O patrocínio é independente do plano e não altera o ranking do jogador.
O financeiro gera uma base fictícia determinística para o mês atual, independente
da agenda. Filtros Hoje/Últimos 7 dias/Mês até hoje excluem datas futuras; Projeção
do mês inteiro mostra a base mensal completa. O extrato é paginado em 20 linhas.

Premissas iniciais, **não médias de mercado comprovadas**: uma quadra por estabelecimento
ativo com espaços cadastrados, 3 reservas de 1h por dia, 26 dias/mês, ticket R$ 120,
20% pelo app e 80% WhatsApp/presencial. Cancelamentos de 5% são arredondados para cima
por canal; fins de semana têm maior peso sem aumentar o total mensal. No cenário de
14 estabelecimentos são 1.092 reservas planejadas, 218 pelo app e 55 cancelamentos.
Somente 207 reservas liquidadas pelo app geram comissão; as 830 diretas válidas não.

A proposta em todas as telas tem dois planos: Free com gestão completa e
Crescimento com BI, campanhas e automações. Hipóteses editáveis: Crescimento
R$ 799/mês, patrocínio separado R$ 100/mês, 10% de adesão ao pago e 10% a patrocínio,
arredondados para baixo (13 Free, 1 Crescimento e 1 anunciante para 14 gestores).
Patrocínio propõe 2–3 destaques por busca, com rodízio entre elegíveis; não limita
o total de anunciantes nem implementa novo ranking. Cadastros Pro/Premium antigos
são normalizados para Crescimento ao carregar, preservando todas as outras informações.
Os IDs internos `freemium`/`premium` permanecem por compatibilidade, mas a interface
e os formulários oferecem somente Free/Crescimento. Não existe mais um terceiro plano.

Taxa adicionada ao preço da quadra: Pix 5%, cartão 10%. Mistura hipotética: 70% Pix,
30% cartão entre reservas do app. Gateway editável: Pix R$ 1,99/transação; cartão
3% sobre o checkout (quadra + taxa) + R$ 0,49/transação; planos e patrocínios 3%.
Esses valores são **hipóteses, não cotações ou preços validados**. Nenhuma comissão
em reservas externas/canceladas/reembolsadas. Premissas da nova proposta ficam
salvas separadamente das antigas no navegador, preservando os dados existentes.

A base padrão projeta receita bruta da plataforma de R$ 2.519,00 e receita após
gateway de R$ 1.925,12 (R$ 872,03 MRR + R$ 1.053,09 taxas). Os 207 pagamentos válidos
do app se dividem em 144 Pix e 63 cartão após cancelamentos. Não é lucro nem dinheiro
recebido: não inclui impostos, infraestrutura, marketing, suporte, chargebacks,
custos de reembolso, parcelamento ou inadimplência dos planos. User/gestor e seu
checkout não foram alterados: esta é apenas a hipótese financeira do modelo de negócio.
Referência de método: [Sebrae · Locação de quadra de esporte](https://bibliotecas.sebrae.com.br/chronus/ARQUIVOS_CHRONUS/IDEIAS_DE_NEGOCIO/PDFS/ideia-de-negocio_locacao-de-quadra-de-esporte.pdf),
que recomenda validar demanda e preços na região e não comprova estas premissas.

Há 15 gestores iniciais fictícios (cadastros locais adicionais
são preservados). Os 12 gestores adicionais publicam 16 quadras fictícias de Society
no catálogo do jogador, além dos espaços já existentes. Reservas desses exemplos
são locais e separadas da operação da Arena Batel; pagamentos continuam simulados.
Exemplos complementam a base antiga sem substituir edições.

### Experiência do jogador

A entrada `/user` reúne busca e resultados; não há páginas duplicadas de início
e quadras. Data, horário e esporte ficam visíveis; bairro, cobertura e a faixa de preço ficam em
Mais filtros (preço mínimo/máximo na mesma linha). Sobre foi retirado da navegação; os links antigos de contato levam
ao suporte. O rodapé claro é compartilhado pelas três áreas.

Clicar em um horário ocupado abre **Avise-me ao liberar**, sem selecionar aquele
horário nem alterar o carrinho. Após a confirmação, o jogador pode abrir voluntariamente
o convite para mensalista, com dia e horário semanal de preferência. Esse convite
não depende de detectar uma segunda reserva e não abre sozinho.
Ambos salvam interesses em `quadrafacil.interesses-demo.v1` no `localStorage`,
evitando inscrições repetidas. Não enviam notificações, não reservam vagas e não
criam contratos. O formulário de suporte simula o envio e não transmite os dados.

### Demonstração das quadras

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

O protótipo desenhado à mão pertence à entrega acadêmica inicial; seu link deve ser
consultado no documento de entrega da equipe. Essa pasta não faz parte deste repositório.
A versão de alta fidelidade é o próprio frontend executado nas rotas acima.

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

| Nome             | Função                                                                                                                                          | GitHub           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Rafael Gomes     | Base inicial do frontend e da API, roteamento e integração inicial                                                                              | RafaelGomes-dev  |
| Rafael Maluf     | Desenvolvimento e redesign do frontend atual (jogador, gestor e superadmin), responsividade, fluxos, organização do Trello, validações e testes | RafaMaluf        |
| Henry Mendes     | Protótipo e documentação                                                                                                                        | HenryMendesr     |
| Tiago Dagnoluzzo | Testes e documentação                                                                                                                           | tiago-dagnoluzzo |
| Erick Meister    | Documentação e ajustes de interface                                                                                                             | Minimeister05    |

O frontend atual evolui a base inicial da equipe: Rafael Maluf realizou a separação
das áreas e o desenvolvimento visual e dos fluxos da versão de alta fidelidade,
incluindo agenda, configurações, financeiro, inteligência e administração interna.
