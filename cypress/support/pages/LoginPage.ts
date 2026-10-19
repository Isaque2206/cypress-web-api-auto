import { PaginaBase } from "./PaginaBase";

export class LoginPage extends PaginaBase {
  private readonly seletores = {
    titulo: "h1",
    email: '[data-testid="email"]',
    senha: '[data-testid="senha"]',
    entrar: '[data-testid="entrar"]',
    cadastrar: '[data-testid="cadastrar"]',
  } as const;

  visitar() {
    cy.visit("/login");
    cy.get(this.seletores.titulo).should("be.visible").and("have.text", "Login");
    return this.evidenciar("tela de login aberta");
  }

  preencherEmail(email: string) {
    return this.preencherCampo(this.seletores.email, email);
  }

  preencherSenha(senha: string) {
    return this.preencherCampo(this.seletores.senha, senha, true);
  }

  submeter() {
    return this.clicarEm(this.seletores.entrar);
  }

  autenticar(email: string, senha: string) {
    this.preencherEmail(email);
    this.preencherSenha(senha);
    return this.submeter();
  }

  devePermanecerNaAutenticacao() {
    cy.location("pathname").should("eq", "/login");
    return this.evidenciar("permaneceu na tela de login");
  }

  irParaCadastro() {
    this.clicarEm(this.seletores.cadastrar);
    cy.location("pathname").should("eq", "/cadastrarusuarios");
    cy.contains("h2", "Cadastro").should("be.visible");
    return this.evidenciar("link levou ao cadastro");
  }

  naoDeveTerSessao() {
    cy.window().should((janela) => {
      expect(janela.localStorage.getItem("serverest/userToken"), "token ausente").to.equal(null);
    });
    return this.evidenciar("nenhuma sessão gravada");
  }
}
