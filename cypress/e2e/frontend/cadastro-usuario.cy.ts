import * as allure from "allure-js-commons";
import { ContextoDeTeste, criarUsuario } from "../../../lib/serverest";
import { CadastroPage, HomePage } from "../../support/pages";
import { descreverCenario } from "../../support/relatorio";

describe("Frontend - Cadastro de usuário", () => {
  const cadastroPage = new CadastroPage();
  const homePage = new HomePage();
  const contexto = new ContextoDeTeste();

  afterEach(() => {
    contexto.limpar();
  });

  it("CT-FE-01 cadastra um usuário comum e encerra a sessão pela home", () => {
    const usuario = criarUsuario();
    contexto.registrarEmail(usuario.email);

    cy.then(() =>
      descreverCenario({
        id: "CT-FE-01",
        epic: "Frontend",
        feature: "Cadastro",
        story: "Usuário comum cria a conta e acessa a vitrine",
        severity: "critical",
        tags: ["frontend", "cadastro", "e2e"],
        description:
          "Cobre o formulário público de cadastro, o alerta de sucesso, o redirecionamento para /home, a sessão gravada no navegador e o logout.",
      }),
    );

    allure.step("Abrir o formulário de cadastro", () => cadastroPage.visitar());

    allure.step("Informar os dados de um usuário não administrador", () => {
      allure.parameter("nome", usuario.nome);
      allure.parameter("email", usuario.email);
      allure.parameter("administrador", usuario.administrador);
      return cadastroPage.cadastrar(usuario);
    });

    allure.step("Confirmar o alerta de cadastro realizado", () => cadastroPage.deveConfirmarCadastro());

    allure.step("Validar o redirecionamento para a home autenticada", () => {
      homePage.deveEstarAutenticada();
      return homePage.deveGuardarSessao(usuario.email);
    });

    allure.step("Encerrar a sessão", () => homePage.sair());
  });
});
