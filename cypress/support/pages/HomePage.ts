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
    return cy.get(this.seletores.logout).should("be.visible");
  }

  deveGuardarSessao(email: string) {
    return cy.window().should((janela) => {
      expect(janela.localStorage.getItem("serverest/userEmail"), "e-mail da sessão").to.eq(email);
      expect(janela.localStorage.getItem("serverest/userToken"), "token da sessão").to.match(
        /^Bearer\s.+/,
      );
    });
  }

  pesquisarProduto(nome: string) {
    cy.intercept("GET", "**/produtos?*").as("buscaProduto");
    this.preencherCampo(this.seletores.pesquisa, nome);
    this.clicarEm(this.seletores.pesquisar);
    return cy.wait("@buscaProduto").its("response.statusCode").should("eq", 200);
  }

  deveListarProduto(nome: string) {
    return cy.contains("h5.card-title", nome).should("be.visible");
  }

  adicionarNaLista(nome: string) {
    cy.contains("h5.card-title", nome)
      .scrollIntoView()
      .closest(".card")
      .find(this.seletores.adicionar)
      .should("be.visible")
      .click();

    return cy.location("pathname").should("eq", "/minhaListaDeProdutos");
  }

  sair() {
    this.clicarEm(this.seletores.logout);
    cy.location("pathname").should("eq", "/login");
    return cy.window().should((janela) => {
      expect(janela.localStorage.getItem("serverest/userToken"), "sessão encerrada").to.equal(
        null,
      );
    });
  }
}
