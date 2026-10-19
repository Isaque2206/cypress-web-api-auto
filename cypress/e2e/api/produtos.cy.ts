import * as allure from "allure-js-commons";
import {
  alteradoComSucessoSchema,
  cadastroComSucessoSchema,
  ContextoDeTeste,
  criarProduto,
  criarUsuario,
  excluidoComSucessoSchema,
  listaProdutosSchema,
  loginComSucessoSchema,
  mensagemErroSchema,
  mensagens,
  produtoSchema,
  validarContrato,
} from "../../../lib/serverest";
import { criarApis } from "../../support/api";
import { descreverCenario } from "../../support/relatorio";

describe("API - Produtos", () => {
  const contexto = new ContextoDeTeste();

  afterEach(() => {
    contexto.limpar();
  });

  it("CT-API-02 restringe o cadastro de produtos a administradores", () => {
    const apis = criarApis();
    const administrador = criarUsuario({ administrador: "true" });
    const cliente = criarUsuario({ administrador: "false" });
    const produto = criarProduto();
    const produtoEditado = {
      ...produto,
      nome: `${produto.nome}Edit`,
      preco: produto.preco + 5,
      descricao: `${produto.descricao} revisado`,
      quantidade: produto.quantidade + 1,
    };

    let tokenAdmin = "";
    let tokenCliente = "";
    let idProduto = "";

    contexto.registrarEmail(administrador.email);
    contexto.registrarEmail(cliente.email);

    cy.then(() =>
      descreverCenario({
        id: "CT-API-02",
        epic: "API",
        feature: "Produtos",
        story: "Somente administrador cadastra, edita e exclui produtos",
        severity: "critical",
        tags: ["api", "produtos", "autorizacao", "swagger"],
        description:
          "Cobre login, ausência de token, rota exclusiva de administrador, nome duplicado e o ciclo de cadastro, consulta, edição e exclusão de /produtos.",
      }),
    );

    allure.step("Cadastrar um administrador e um cliente e autenticar os dois", () =>
      apis.usuarios.cadastrar(administrador).then((respostaAdmin) => {
        expect(respostaAdmin.status, "cadastro do administrador").to.eq(201);
        const adminCriado = validarContrato(
          cadastroComSucessoSchema,
          respostaAdmin.body,
          "cadastroComSucesso",
        );

        return apis.usuarios.cadastrar(cliente).then((respostaCliente) => {
          expect(respostaCliente.status, "cadastro do cliente").to.eq(201);
          const clienteCriado = validarContrato(
            cadastroComSucessoSchema,
            respostaCliente.body,
            "cadastroComSucesso",
          );

          return apis.autenticacao.entrarCom(administrador).then((loginAdmin) => {
            expect(loginAdmin.status, "login do administrador").to.eq(200);
            const sessaoAdmin = validarContrato(
              loginComSucessoSchema,
              loginAdmin.body,
              "loginComSucesso",
            );
            tokenAdmin = sessaoAdmin.authorization;
            contexto.registrarUsuario(adminCriado._id, tokenAdmin);
            expect(sessaoAdmin.message, "mensagem de login").to.eq(mensagens.loginSucesso);

            return apis.autenticacao.entrarCom(cliente).then((loginCliente) => {
              expect(loginCliente.status, "login do cliente").to.eq(200);
              const sessaoCliente = validarContrato(
                loginComSucessoSchema,
                loginCliente.body,
                "loginComSucesso",
              );
              tokenCliente = sessaoCliente.authorization;
              contexto.registrarUsuario(clienteCriado._id, tokenCliente);
            });
          });
        });
      }),
    );

    allure.step("Recusar produto sem token e com token de usuário comum", () => {
      return apis.produtos.cadastrar(produto).then((semToken) => {
        expect(semToken.status, "status sem token").to.eq(401);
        const erroToken = validarContrato(mensagemErroSchema, semToken.body, "tokenAusente");
        expect(erroToken.message, "mensagem de token").to.eq(mensagens.tokenAusente);

        return apis.produtos.cadastrar(produto, tokenCliente).then((semPermissao) => {
          expect(semPermissao.status, "status do cliente").to.eq(403);
          const erroPermissao = validarContrato(
            mensagemErroSchema,
            semPermissao.body,
            "rotaParaAdministradores",
          );
          expect(erroPermissao.message, "mensagem de permissão").to.eq(
            mensagens.rotaAdministradores,
          );
        });
      });
    });

    allure.step("Cadastrar o produto com o token de administrador", () =>
      apis.produtos.cadastrar(produto, tokenAdmin).then((resposta) => {
        expect(resposta.status, "status do cadastro de produto").to.eq(201);
        const corpo = validarContrato(cadastroComSucessoSchema, resposta.body, "cadastroComSucesso");
        idProduto = corpo._id;
        contexto.registrarProduto(idProduto, tokenAdmin);
        allure.parameter("produto", produto.nome);
        allure.parameter("idProduto", idProduto);
      }),
    );

    allure.step("Consultar o produto pelo id", () =>
      apis.produtos.buscarPorId(idProduto).then((resposta) => {
        expect(resposta.status, "status da consulta").to.eq(200);
        const corpo = validarContrato(produtoSchema, resposta.body, "getProdutosId");
        expect(corpo.nome, "nome").to.eq(produto.nome);
        expect(corpo.preco, "preço").to.eq(produto.preco);
        expect(corpo.descricao, "descrição").to.eq(produto.descricao);
        expect(corpo.quantidade, "quantidade").to.eq(produto.quantidade);
        expect(corpo._id, "id").to.eq(idProduto);
      }),
    );

    allure.step("Recusar outro produto com o mesmo nome", () =>
      apis.produtos.cadastrar(produto, tokenAdmin).then((resposta) => {
        expect(resposta.status, "status de nome duplicado").to.eq(400);
        const corpo = validarContrato(mensagemErroSchema, resposta.body, "existeProdutoComEsseNome");
        expect(corpo.message, "mensagem de nome duplicado").to.eq(mensagens.produtoNomeDuplicado);
      }),
    );

    allure.step("Editar preço, descrição, nome e quantidade", () =>
      apis.produtos.atualizar(idProduto, produtoEditado, tokenAdmin).then((resposta) => {
        expect(resposta.status, "status da edição").to.eq(200);
        const corpo = validarContrato(alteradoComSucessoSchema, resposta.body, "alteradoComSucesso");
        expect(corpo.message, "mensagem de alteração").to.eq(mensagens.registroAlterado);
      }),
    );

    allure.step("Encontrar o produto editado na listagem por nome", () =>
      apis.produtos.listar({ nome: produtoEditado.nome }).then((resposta) => {
        expect(resposta.status, "status da listagem").to.eq(200);
        const corpo = validarContrato(listaProdutosSchema, resposta.body, "getProdutos");
        expect(corpo.quantidade, "quantidade filtrada").to.eq(1);
        expect(corpo.produtos[0]._id, "id filtrado").to.eq(idProduto);
        expect(corpo.produtos[0].preco, "preço editado").to.eq(produtoEditado.preco);
        expect(corpo.produtos[0].quantidade, "quantidade editada").to.eq(produtoEditado.quantidade);
      }),
    );

    allure.step("Excluir o produto e confirmar que ele não existe mais", () =>
      apis.produtos.excluir(idProduto, tokenAdmin).then((exclusao) => {
        expect(exclusao.status, "status da exclusão").to.eq(200);
        const corpo = validarContrato(excluidoComSucessoSchema, exclusao.body, "registroExcluido");
        expect(corpo.message, "mensagem de exclusão").to.eq(mensagens.registroExcluido);

        return apis.produtos.buscarPorId(idProduto).then((consulta) => {
          expect(consulta.status, "status após exclusão").to.eq(400);
          const erro = validarContrato(mensagemErroSchema, consulta.body, "produtoNaoEncontrado");
          expect(erro.message, "mensagem de produto ausente").to.eq(mensagens.produtoNaoEncontrado);
        });
      }),
    );
  });
});
