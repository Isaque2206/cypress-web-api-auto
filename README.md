# Automação ServeRest com Cypress

Suíte do desafio de Analista de Qualidade para o [frontend ServeRest](https://front.serverest.dev/) e para a [API documentada no Swagger](https://serverest.dev/).

O enunciado pede 3 cenários de ponta a ponta na interface e 3 cenários de API, no mesmo repositório Cypress. Este projeto entrega esses seis fluxos, com Page Object, contrato da API e relatório Allure. A pipeline publica o relatório a cada pull request e a cada push na `main`.

Repositório: [github.com/Isaque2206/cypress-web-api-auto](https://github.com/Isaque2206/cypress-web-api-auto)

## Cenários

| Id | Camada | Arquivo | O que valida |
| --- | --- | --- | --- |
| CT-FE-01 | Frontend | `cypress/e2e/frontend/cadastro-usuario.cy.ts` | Cadastro de usuário comum, alerta de sucesso, entrada na home e logout |
| CT-FE-02 | Frontend | `cypress/e2e/frontend/login.cy.ts` | Login com credenciais inválidas e caminho até o cadastro |
| CT-FE-03 | Frontend | `cypress/e2e/frontend/lista-de-compras.cy.ts` | Pesquisa de produto, inclusão na lista, aumento de quantidade e lista vazia |
| CT-API-01 | API | `cypress/e2e/api/usuarios.cy.ts` | Cadastro, e-mail duplicado, consulta, edição e exclusão de `/usuarios` |
| CT-API-02 | API | `cypress/e2e/api/produtos.cy.ts` | Login, bloqueio sem token, rota só de administrador e ciclo de `/produtos` |
| CT-API-03 | API | `cypress/e2e/api/carrinhos.cy.ts` | Carrinho, preço total, baixa de estoque, cancelamento e conclusão de compra |

Cada cenário cria e-mail e nome únicos no ServeRest público e apaga usuário, produto e carrinho ao final.

## Requisitos

- Node.js 22
- Java 21, usado pelo Allure para gerar o HTML
- Google Chrome
- Internet, porque os testes falam com `https://front.serverest.dev` e `https://serverest.dev`

No PowerShell deste Windows, `npm` pode ser bloqueado pela política de execução. Nesse caso, troque `npm` por `npm.cmd` nos comandos abaixo.

## Preparar o projeto

Na raiz do repositório:

```bash
npm ci
```

`npm ci` instala exatamente as versões do `package-lock.json`, inclusive o Cypress e o Allure.

## Executar na máquina

| Comando | O que faz |
| --- | --- |
| `npm test` | Roda os 6 cenários no Chrome, sem abrir janela, e gera `allure-report/` |
| `npm run test:frontend` | Roda só a interface, gera o Allure e abre o relatório |
| `npm run test:frontend:headed` | Igual ao anterior, com o Chrome visível durante a execução |
| `npm run test:api` | Roda só a API, no Chrome, sem abrir janela e sem abrir o relatório |
| `npm run allure:report` | Gera o HTML a partir de `allure-results/` e abre no navegador |
| `npm run cy:open` | Abre a interface do Cypress para escolher um arquivo e acompanhar cada comando |
| `npm run typecheck` | Confere os tipos do TypeScript sem executar teste |

Depois de `npm run test:api`, o relatório ainda não abre sozinho. Rode `npm run allure:report` em seguida.

`npm run test:frontend` apaga `allure-results/` antes de começar, para o relatório mostrar só aquela execução. `npm test` e `npm run test:api` acumulam o resultado da execução anterior.

## Relatório Allure

O Allure guarda passos, parâmetros, severidade, tags e o link da superfície exercitada. Na interface, cada validação de tela vira um passo **Evidência** com o print daquele assert. Na API, o anexo é o JSON da resposta. Falha de interface também gera screenshot em `cypress/screenshots/`.

Abra o relatório pelo comando, não pelo arquivo:

```bash
npm run allure:open
```

`allure-report/index.html` aberto direto do disco fica em branco, com a mensagem **Failed to fetch**. O Chrome bloqueia a leitura das pastas `data` e `widgets` quando a página não passa por um servidor. `npm run allure:open` sobe esse servidor e abre o navegador. Deixe o terminal aberto enquanto consulta a página.

No relatório:

1. **Overview** mostra os gráficos de status, severidade, duração e suítes.
2. **Suites** lista os seis cenários.
3. Dentro de um cenário de frontend, expanda o passo da validação e depois **Evidência** para ver o print.

## Pipeline

O workflow fica em `.github/workflows/cypress.yml` e se chama **Cypress ServeRest**.

Ele dispara em dois momentos:

- a cada pull request aberto ou atualizado
- a cada push na branch `main`

Uma execução nova do mesmo branch cancela a anterior. O job `automacao` roda no Ubuntu, instala Node.js 22, Java 21 e o Google Chrome, executa `npm ci` e `npm run test:e2e`, gera o Allure e publica o artefato `allure-report`. Esse artefato sai mesmo quando algum cenário falha, para a evidência continuar disponível.

Para ver o resultado:

1. Abra a aba **Actions** do repositório.
2. Entre na execução desejada.
3. No resumo, role até **Artifacts** e baixe `allure-report`.
4. Extraia o zip. O HTML fica em `allure-report/index.html`.
5. Sirva essa pasta em vez de dar dois cliques no arquivo:

```bash
npx allure open "caminho/extraido/allure-report"
```

## Organização

```text
lib/serverest/          biblioteca de apoio, independente das telas
  factories.ts          massa com Faker
  esquemas.ts           contratos Zod espelhados no Swagger
  cliente.ts            cliente HTTP em cima do cy.request
  contexto.ts           limpeza dos recursos criados
  enderecos.ts          URLs do frontend e da API
cypress/support/pages/  Page Objects do frontend
cypress/support/api/    objetos de API, um por recurso do Swagger
cypress/e2e/frontend/   cenários de interface
cypress/e2e/api/        cenários de API
.github/workflows/      pipeline que roda nos pull requests e na main
```

O Page Object guarda os seletores `data-testid` e as ações de cada tela. Depois de cada validação visível, ele tira o print e anexa no passo do Allure. A API segue o mesmo desenho: `UsuariosApi`, `ProdutosApi`, `CarrinhosApi` e `AutenticacaoApi` conhecem os caminhos. A biblioteca conhece HTTP, contrato e massa.

As assertivas de negócio ficam nos cenários: status, mensagem e campos que a regra exige. A biblioteca só valida o schema e falha citando o nome do componente do Swagger quando a resposta foge do contrato.

## Bibliotecas

- [Cypress](https://www.cypress.io/) como framework
- [allure-cypress](https://allurereport.org/docs/cypress/) com passos, anexos e metadados
- [Zod](https://zod.dev/) para o contrato da API
- [@faker-js/faker](https://fakerjs.dev/) para gerar usuário e produto sem colidir com a base compartilhada
