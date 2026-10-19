import { mensagens } from "../../../lib/serverest";
import { PaginaBase } from "./PaginaBase";

export class ListaComprasPage extends PaginaBase {
  private readonly seletores = {
    nome: '[data-testid="shopping-cart-product-name"]',
    quantidade: '[data-testid="shopping-cart-product-quantity"]',
    aumentar: '[data-testid="product-increase-quantity"]',
    limpar: '[data-testid="limparLista"]',
    vazio: '[data-testid="shopping-cart-empty-message"]',
  } as const;

  deveEstarAberta() {
    cy.location("pathname").should("eq", "/minhaListaDeProdutos");
    cy.contains("h1", "Lista de Compras").should("be.visible");
    return this.evidenciar("lista de compras aberta");
  }

  deveConterProduto(nome: string, quantidade: number) {
    cy.get(this.seletores.nome).should("be.visible").and("contain.text", nome);
    cy.get(this.seletores.quantidade).should("be.visible").and("contain.text", `Total: ${quantidade}`);
    return this.evidenciar(`lista com ${nome} quantidade ${quantidade}`);
  }

  aumentarQuantidade() {
    return cy.get(this.seletores.aumentar).should("be.visible").click();
  }

  limparLista() {
    return cy.get(this.seletores.limpar).should("be.visible").click();
  }

  deveEstarVazia() {
    cy.get(this.seletores.vazio).should("be.visible").and("have.text", mensagens.carrinhoVazio);
    return this.evidenciar("lista vazia");
  }
}
