import * as allure from "allure-js-commons";
import { criarUsuario, mensagens } from "../../../lib/serverest";
import { LoginPage } from "../../support/pages";
import { descreverCenario } from "../../support/relatorio";

describe("Frontend - Login", () => {
  const loginPage = new LoginPage();

  it("CT-FE-02 recusa credenciais inválidas e oferece o cadastro", () => {
    const usuario = criarUsuario();

    cy.then(() =>
      descreverCenario({
        id: "CT-FE-02",
        epic: "Frontend",
        feature: "Login",
        story: "Credenciais desconhecidas não abrem a área logada",
        severity: "critical",
        tags: ["frontend", "login", "negativo"],
        description:
          "Envia e-mail e senha que não existem na API, confere a mensagem Email e/ou senha inválidos e segue o link Cadastre-se.",
      }),
    );

    allure.step("Abrir a tela de login", () => loginPage.visitar());

    allure.step("Enviar credenciais que a API não reconhece", () => {
      allure.parameter("email", usuario.email);
      allure.parameter("password", usuario.password, { mode: "masked" });
      return loginPage.autenticar(usuario.email, usuario.password);
    });

    allure.step("Exibir o alerta retornado pela API e manter a rota de login", () => {
      loginPage.deveExibirAlerta(mensagens.credenciaisInvalidas);
      loginPage.devePermanecerNaAutenticacao();
      return loginPage.naoDeveTerSessao();
    });

    allure.step("Seguir o link de cadastro", () => loginPage.irParaCadastro());
  });
});
