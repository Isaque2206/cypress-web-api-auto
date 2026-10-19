import * as allure from "allure-js-commons";
import {
  cadastroComSucessoSchema,
  ContextoDeTeste,
  criarProduto,
  criarUsuario,
  loginComSucessoSchema,
  validarContrato,
} from "../../../lib/serverest";
import { criarApis } from "../../support/api";
import { HomePage, ListaComprasPage, LoginPage } from "../../support/pages";
import { descreverCenario } from "../../support/relatorio";

describe("Frontend - Lista de compras", () => {
  const loginPage = new LoginPage();
  const homePage = new HomePage();
  const listaPage = new ListaComprasPage();
  const contexto = new ContextoDeTeste();

  const massa = {
    email: "",
    password: "",
    produto: "",
  };

  afterEach(() => {
    contexto.limpar();
  });

  it("CT-FE-03 pesquisa um produto, altera a quantidade e limpa a lista", () => {
    const apis = criarApis();
    const administrador = criarUsuario({ administrador: "true", nome: "Admin Vitrine" });
    const cliente = criarUsuario({ nome: "Cliente Lista" });
    const produto = criarProduto({ quantidade: 8 });
    massa.email = cliente.email;
    massa.password = cliente.password;
    massa.produto = produto.nome;
    contexto.registrarEmail(administrador.email);
    contexto.registrarEmail(cliente.email);

    cy.then(() =>
      descreverCenario({
        id: "CT-FE-03",
        epic: "Frontend",
        feature: "Lista de compras",
        story: "Cliente encontra um produto e ajusta a lista local",
        severity: "critical",
        tags: ["frontend", "produtos", "carrinho", "e2e"],
        description:
          "Prepara usuário e produto pela API, autentica pela interface, pesquisa o produto, adiciona na lista, aumenta a quantidade e limpa a lista.",
      }),
    );

    allure.step("Preparar administrador, cliente e produto exclusivo pela API", () => {
      allure.parameter("produto", produto.nome);
      allure.parameter("cliente", cliente.email);

      return apis.usuarios
        .cadastrar(administrador)
        .then((respostaAdmin) => {
          expect(respostaAdmin.status, "cadastro do administrador").to.eq(201);
          const adminCriado = validarContrato(
            cadastroComSucessoSchema,
            respostaAdmin.body,
            "cadastroComSucesso",
          );

          return apis.usuarios.cadastrar(cliente).then((respostaCliente) => {
            expect(respostaCliente.status, "cadastro do cliente").to.eq(201);
            validarContrato(cadastroComSucessoSchema, respostaCliente.body, "cadastroComSucesso");

            return apis.autenticacao.entrarCom(administrador).then((login) => {
              expect(login.status, "login do administrador").to.eq(200);
              const sessao = validarContrato(loginComSucessoSchema, login.body, "loginComSucesso");
              contexto.registrarUsuario(adminCriado._id, sessao.authorization);

              return apis.produtos.cadastrar(produto, sessao.authorization).then((respostaProduto) => {
                expect(respostaProduto.status, "cadastro do produto").to.eq(201);
                const produtoCriado = validarContrato(
                  cadastroComSucessoSchema,
                  respostaProduto.body,
                  "cadastroComSucesso",
                );
                contexto.registrarProduto(produtoCriado._id, sessao.authorization);
              });
            });
          });
        });
    });

    allure.step("Autenticar o cliente pela tela de login", () => {
      loginPage.visitar();
      loginPage.autenticar(massa.email, massa.password);
      homePage.deveEstarAutenticada();
      return homePage.deveGuardarSessao(massa.email);
    });

    allure.step("Pesquisar o produto cadastrado para o cenário", () => {
      homePage.pesquisarProduto(massa.produto);
      return homePage.deveListarProduto(massa.produto);
    });

    allure.step("Adicionar o produto na lista de compras", () => {
      homePage.adicionarNaLista(massa.produto);
      listaPage.deveEstarAberta();
      return listaPage.deveConterProduto(massa.produto, 1);
    });

    allure.step("Aumentar a quantidade do item", () => {
      listaPage.aumentarQuantidade();
      return listaPage.deveConterProduto(massa.produto, 2);
    });

    allure.step("Limpar a lista e exibir o estado vazio", () => {
      listaPage.limparLista();
      return listaPage.deveEstarVazia();
    });
  });
});
