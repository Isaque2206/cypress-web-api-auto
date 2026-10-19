import { PaginaBase } from "./PaginaBase";

export class HomePage extends PaginaBase {
  private readonly seletores = {
    logout: '[data-testid="logout"]',
    pesquisa: '[data-testid="pesquisar"]',
    pesquisar: '[data-testid="botaoPesquisar"]',
    adicionar: '[data-testid="adicionarNaLista"]',
  } as const;

  deveEstarAutenticada() {
    cy.location("pathname", { timeout: 20000 }).should("eq", "/home");
    cy.contains("h4", "Produtos").should("be.visible");
    cy.get(this.seletores.logout).should("be.visible");
    return this.evidenciar("home autenticada");
  }

  deveGuardarSessao(email: string) {
    cy.window().should((janela) => {
      expect(janela.localStorage.getItem("serverest/userEmail"), "e-mail da sessão").to.eq(email);
      const token = janela.localStorage.getItem("serverest/userToken") ?? "";
      expect(token.startsWith("Bearer "), "sessão com Bearer token").to.eq(true);
      expect(token.length, "tamanho do token").to.be.greaterThan("Bearer ".length);
    });
    return this.evidenciar("sessão gravada no navegador");
  }

  pesquisarProduto(nome: string) {
    cy.intercept("GET", "**/produtos?*").as("buscaProduto");
    this.preencherCampo(this.seletores.pesquisa, nome);
    this.clicarEm(this.seletores.pesquisar);
    return cy.wait("@buscaProduto").its("response.statusCode").should("eq", 200);
  }

  deveListarProduto(nome: string) {
    cy.contains("h5.card-title", nome).should("be.visible");
    return this.evidenciar(`produto listado ${nome}`);
  }

  adicionarNaLista(nome: string) {
    cy.contains("h5.card-title", nome)
      .scrollIntoView()
      .closest(".card")
      .find(this.seletores.adicionar)
      .should("be.visible")
      .click();

    cy.location("pathname").should("eq", "/minhaListaDeProdutos");
    return this.evidenciar(`produto adicionado ${nome}`);
  }

  sair() {
    this.clicarEm(this.seletores.logout);
    cy.location("pathname").should("eq", "/login");
    cy.window().should((janela) => {
      expect(janela.localStorage.getItem("serverest/userToken"), "sessão encerrada").to.equal(
        null,
      );
    });
    return this.evidenciar("sessão encerrada na tela de login");
  }
}
