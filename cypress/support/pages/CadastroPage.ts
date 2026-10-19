import type { NovoUsuario } from "../../../lib/serverest";
import { mensagens } from "../../../lib/serverest";
import { PaginaBase } from "./PaginaBase";

export class CadastroPage extends PaginaBase {
  private readonly seletores = {
    titulo: "h2",
    nome: '[data-testid="nome"]',
    email: '[data-testid="email"]',
    senha: '[data-testid="password"]',
    administrador: '[data-testid="checkbox"]',
    cadastrar: '[data-testid="cadastrar"]',
  } as const;

  visitar() {
    cy.visit("/cadastrarusuarios");
    cy.get(this.seletores.titulo).should("be.visible").and("have.text", "Cadastro");
    return this.evidenciar("formulário de cadastro aberto");
  }

  preencher(usuario: NovoUsuario) {
    this.preencherCampo(this.seletores.nome, usuario.nome);
    this.preencherCampo(this.seletores.email, usuario.email);
    this.preencherCampo(this.seletores.senha, usuario.password, true);

    if (usuario.administrador === "true") {
      return cy.get(this.seletores.administrador).check();
    }

    return cy.get(this.seletores.nome).should("have.value", usuario.nome);
  }

  submeter() {
    return this.clicarEm(this.seletores.cadastrar);
  }

  cadastrar(usuario: NovoUsuario) {
    this.preencher(usuario);
    return this.submeter();
  }

  deveConfirmarCadastro() {
    return this.deveExibirAlerta(mensagens.cadastroSucesso);
  }
}
