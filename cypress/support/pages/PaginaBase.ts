import * as allure from "allure-js-commons";

export abstract class PaginaBase {
  protected evidenciar(descricao: string) {
    const arquivo = descricao.replace(/[<>:"/\\|?*]/g, " ");

    return allure.step(`Evidência: ${descricao}`, () =>
      cy.screenshot(arquivo, { capture: "viewport" }),
    );
  }

  protected preencherCampo(seletor: string, valor: string, ocultarLog = false) {
    return cy.get(seletor).should("be.visible").clear().type(valor, { log: !ocultarLog });
  }

  protected clicarEm(seletor: string) {
    return cy.get(seletor).should("be.visible").click();
  }

  deveExibirAlerta(mensagem: string) {
    cy.get(".alert", { timeout: 20000 }).should("be.visible").and("contain.text", mensagem);
    return this.evidenciar(`alerta ${mensagem}`);
  }
}
