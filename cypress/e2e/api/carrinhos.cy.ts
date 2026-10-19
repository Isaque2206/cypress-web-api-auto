import * as allure from "allure-js-commons";
import {
  cadastroComSucessoSchema,
  carrinhoSchema,
  ContextoDeTeste,
  criarProduto,
  criarUsuario,
  erroProdutoEmCarrinhoSchema,
  erroUsuarioComCarrinhoSchema,
  listaCarrinhosSchema,
  loginComSucessoSchema,
  mensagemErroSchema,
  mensagens,
  produtoSchema,
  validarContrato,
} from "../../../lib/serverest";
import { criarApis } from "../../support/api";
import { descreverCenario } from "../../support/relatorio";

describe("API - Carrinhos", () => {
  const contexto = new ContextoDeTeste();

  afterEach(() => {
    contexto.limpar();
  });

  it("CT-API-03 reserva estoque no carrinho e devolve a quantidade ao cancelar", () => {
    const apis = criarApis();
    const administrador = criarUsuario({ administrador: "true" });
    const cliente = criarUsuario({ administrador: "false" });
    const produto = criarProduto({ preco: 40, quantidade: 6 });
    const quantidadeReservada = 2;

    let tokenAdmin = "";
    let tokenCliente = "";
    let idUsuario = "";
    let idProduto = "";
    let idCarrinho = "";

    contexto.registrarEmail(administrador.email);
    contexto.registrarEmail(cliente.email);

    cy.then(() =>
      descreverCenario({
        id: "CT-API-03",
        epic: "API",
        feature: "Carrinhos",
        story: "Carrinho reserva estoque e o cancelamento recompõe o produto",
        severity: "critical",
        tags: ["api", "carrinhos", "estoque", "swagger"],
        description:
          "Cria um carrinho, valida preço total e baixa de estoque, bloqueia exclusões enquanto o carrinho existe, cancela a compra para repor o estoque e conclui uma segunda compra.",
      }),
    );

    allure.step("Preparar cliente, administrador e produto com estoque conhecido", () =>
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
          idUsuario = clienteCriado._id;

          return apis.autenticacao.entrarCom(administrador).then((loginAdmin) => {
            const sessaoAdmin = validarContrato(
              loginComSucessoSchema,
              loginAdmin.body,
              "loginComSucesso",
            );
            tokenAdmin = sessaoAdmin.authorization;
            contexto.registrarUsuario(adminCriado._id, tokenAdmin);

            return apis.autenticacao.entrarCom(cliente).then((loginCliente) => {
              const sessaoCliente = validarContrato(
                loginComSucessoSchema,
                loginCliente.body,
                "loginComSucesso",
              );
              tokenCliente = sessaoCliente.authorization;
              contexto.registrarUsuario(idUsuario, tokenCliente);

              return apis.produtos.cadastrar(produto, tokenAdmin).then((respostaProduto) => {
                expect(respostaProduto.status, "cadastro do produto").to.eq(201);
                const produtoCriado = validarContrato(
                  cadastroComSucessoSchema,
                  respostaProduto.body,
                  "cadastroComSucesso",
                );
                idProduto = produtoCriado._id;
                contexto.registrarProduto(idProduto, tokenAdmin);
              });
            });
          });
        });
      }),
    );

    allure.step("Cadastrar o carrinho com duas unidades do produto", () =>
      apis.carrinhos
        .cadastrar({ produtos: [{ idProduto, quantidade: quantidadeReservada }] }, tokenCliente)
        .then((resposta) => {
          expect(resposta.status, "status do carrinho").to.eq(201);
          const corpo = validarContrato(cadastroComSucessoSchema, resposta.body, "cadastroComSucesso");
          idCarrinho = corpo._id;
          expect(corpo.message, "mensagem do carrinho").to.eq(mensagens.cadastroSucesso);
        }),
    );

    allure.step("Conferir totais do carrinho e a baixa no estoque", () =>
      apis.carrinhos.buscarPorId(idCarrinho).then((resposta) => {
        expect(resposta.status, "status da consulta do carrinho").to.eq(200);
        const carrinho = validarContrato(carrinhoSchema, resposta.body, "getCarrinhosId");
        expect(carrinho.idUsuario, "dono do carrinho").to.eq(idUsuario);
        expect(carrinho.quantidadeTotal, "quantidade total").to.eq(quantidadeReservada);
        expect(carrinho.precoTotal, "preço total").to.eq(produto.preco * quantidadeReservada);
        expect(carrinho.produtos, "itens do carrinho").to.have.length(1);
        expect(carrinho.produtos[0].idProduto, "produto do item").to.eq(idProduto);
        expect(carrinho.produtos[0].quantidade, "quantidade do item").to.eq(quantidadeReservada);
        expect(carrinho.produtos[0].precoUnitario, "preço unitário").to.eq(produto.preco);

        return apis.carrinhos.listar({ idUsuario }).then((lista) => {
          expect(lista.status, "status da listagem de carrinhos").to.eq(200);
          const encontrados = validarContrato(listaCarrinhosSchema, lista.body, "getCarrinhos");
          expect(encontrados.quantidade, "carrinhos do usuário").to.eq(1);
          expect(encontrados.carrinhos[0]._id, "id listado").to.eq(idCarrinho);

          return apis.produtos.buscarPorId(idProduto).then((produtoAtual) => {
            expect(produtoAtual.status, "status do produto reservado").to.eq(200);
            const estoque = validarContrato(produtoSchema, produtoAtual.body, "getProdutosId");
            expect(estoque.quantidade, "estoque após a reserva").to.eq(
              produto.quantidade - quantidadeReservada,
            );
          });
        });
      }),
    );

    allure.step("Bloquear exclusão do usuário, do produto e de um segundo carrinho", () =>
      apis.usuarios.excluir(idUsuario).then((exclusaoUsuario) => {
        expect(exclusaoUsuario.status, "status ao excluir usuário com carrinho").to.eq(400);
        const erroUsuario = validarContrato(
          erroUsuarioComCarrinhoSchema,
          exclusaoUsuario.body,
          "naoPermitidoExcluirUsuarioComCarrinho",
        );
        expect(erroUsuario.idCarrinho, "carrinho que impede a exclusão").to.eq(idCarrinho);

        return apis.produtos.excluir(idProduto, tokenAdmin).then((exclusaoProduto) => {
          expect(exclusaoProduto.status, "status ao excluir produto do carrinho").to.eq(400);
          const erroProduto = validarContrato(
            erroProdutoEmCarrinhoSchema,
            exclusaoProduto.body,
            "naoPermitidoExcluirProdutoDeCarrinho",
          );
          expect(erroProduto.idCarrinhos, "carrinhos vinculados").to.include(idCarrinho);

          return apis.carrinhos
            .cadastrar({ produtos: [{ idProduto, quantidade: 1 }] }, tokenCliente)
            .then((duplicado) => {
              expect(duplicado.status, "status do segundo carrinho").to.eq(400);
              const erro = validarContrato(mensagemErroSchema, duplicado.body, "carrinhoDuplicado");
              expect(erro.message, "mensagem de carrinho único").to.eq(mensagens.carrinhoDuplicado);
            });
        });
      }),
    );

    allure.step("Cancelar a compra e repor o estoque do produto", () =>
      apis.carrinhos.cancelarCompra(tokenCliente).then((cancelamento) => {
        expect(cancelamento.status, "status do cancelamento").to.eq(200);
        const corpo = validarContrato(mensagemErroSchema, cancelamento.body, "compraCancelada");
        expect(corpo.message, "mensagem de reposição").to.eq(mensagens.compraCancelada);

        return apis.produtos.buscarPorId(idProduto).then((produtoAtual) => {
          const estoque = validarContrato(produtoSchema, produtoAtual.body, "getProdutosId");
          expect(estoque.quantidade, "estoque reposto").to.eq(produto.quantidade);
        });
      }),
    );

    allure.step("Concluir uma nova compra e manter a baixa definitiva de estoque", () =>
      apis.carrinhos
        .cadastrar({ produtos: [{ idProduto, quantidade: 1 }] }, tokenCliente)
        .then((novoCarrinho) => {
          expect(novoCarrinho.status, "status do novo carrinho").to.eq(201);

          return apis.carrinhos.concluirCompra(tokenCliente).then((conclusao) => {
            expect(conclusao.status, "status da conclusão").to.eq(200);
            const corpo = validarContrato(mensagemErroSchema, conclusao.body, "compraConcluida");
            expect(corpo.message, "mensagem da conclusão").to.eq(mensagens.compraConcluida);

            return apis.produtos.buscarPorId(idProduto).then((produtoAtual) => {
              const estoque = validarContrato(produtoSchema, produtoAtual.body, "getProdutosId");
              expect(estoque.quantidade, "estoque após concluir").to.eq(produto.quantidade - 1);
            });
          });
        }),
    );
  });
});
