export abstract class PaginaBase {
  protected preencherCampo(seletor: string, valor: string, ocultarLog = false) {
    return cy.get(seletor).should("be.visible").clear().type(valor, { log: !ocultarLog });
  }

  protected clicarEm(seletor: string) {
    return cy.get(seletor).should("be.visible").click();
  }

  deveExibirAlerta(mensagem: string) {
    return cy
      .get(".alert", { timeout: 20000 })
      .should("be.visible")
      .and("contain.text", mensagem);
  }
}
