# Automação ServeRest com Cypress

Suíte do desafio de Analista de Qualidade para o [frontend ServeRest](https://front.serverest.dev/) e para a [API documentada no Swagger](https://serverest.dev/).

São 3 cenários de ponta a ponta na interface e 3 cenários de API. Os dois lados ficam no mesmo repositório. O relatório de todos os testes sai no Allure.

## Cenários

| Id | Camada | O que valida |
| --- | --- | --- |
| CT-FE-01 | Frontend | Cadastro de usuário comum, alerta de sucesso, entrada na home e logout |
| CT-FE-02 | Frontend | Login com credenciais inválidas e caminho até o cadastro |
| CT-FE-03 | Frontend | Pesquisa de produto, inclusão na lista, aumento de quantidade e lista vazia |
| CT-API-01 | API | Cadastro, e-mail duplicado, consulta, edição e exclusão de `/usuarios` |
| CT-API-02 | API | Login, bloqueio sem token, rota só de administrador e ciclo de `/produtos` |
| CT-API-03 | API | Carrinho, preço total, baixa de estoque, cancelamento e conclusão de compra |

## Como executar

Requisitos: Node.js 22 e Java 21 (o Allure Commandline usa a JVM para gerar o HTML).

```bash
npm ci
npm test
```

`npm test` roda o Cypress em modo headless e gera `allure-report/`. Para abrir o relatório:

```bash
npm run allure:open
```

Atalhos:

```bash
npm run test:frontend
npm run test:api
npm run cy:open
```

Os testes conversam com o ServeRest público. Cada cenário cria dados com e-mail e nome únicos e apaga usuário, produto e carrinho ao final.

## Organização

```text
lib/serverest/          biblioteca de apoio, independente das telas
  factories.ts          massa com Faker
  esquemas.ts           contratos Zod espelhados no Swagger
  cliente.ts            cliente HTTP em cima do cy.request
  contexto.ts           limpeza dos recursos criados
cypress/support/pages/  Page Objects do frontend
cypress/support/api/    objetos de API, um por recurso do Swagger
cypress/e2e/frontend/   cenários E2E
cypress/e2e/api/        cenários de API
```

O Page Object guarda seletores `data-testid` e as ações de cada tela. A API segue o mesmo desenho: `UsuariosApi`, `ProdutosApi`, `CarrinhosApi` e `AutenticacaoApi` conhecem os caminhos, e a biblioteca conhece HTTP, contrato e massa.

As assertivas ficam nos cenários. A biblioteca só valida o schema e falha citando o nome do componente do Swagger quando a resposta foge do contrato.

## Bibliotecas

- [Cypress](https://www.cypress.io/) como framework
- [allure-cypress](https://allurereport.org/docs/cypress/) com passos, anexos JSON e metadados em todos os testes
- [Zod](https://zod.dev/) para o contrato da API
- [@faker-js/faker](https://fakerjs.dev/) para gerar usuário e produto sem colidir com a base compartilhada

## Relatório

Cada cenário recebe épico, feature, severidade, tag e link da superfície exercitada. As respostas de API entram como anexo JSON. Falha de interface gera screenshot em `cypress/screenshots/`, e o Allure incorpora essa evidência.
