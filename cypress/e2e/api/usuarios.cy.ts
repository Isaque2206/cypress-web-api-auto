import * as allure from "allure-js-commons";
import {
  alteradoComSucessoSchema,
  cadastroComSucessoSchema,
  ContextoDeTeste,
  criarUsuario,
  excluidoComSucessoSchema,
  listaUsuariosSchema,
  mensagemErroSchema,
  mensagens,
  usuarioSchema,
  validarContrato,
} from "../../../lib/serverest";
import { criarApis } from "../../support/api";
import { descreverCenario } from "../../support/relatorio";

describe("API - Usuários", () => {
  const contexto = new ContextoDeTeste();

  afterEach(() => {
    contexto.limpar();
  });

  it("CT-API-01 cadastra, consulta, atualiza e exclui um usuário", () => {
    const apis = criarApis();
    const usuario = criarUsuario();
    const nomeAlterado = `${usuario.nome} Editado`;
    let id = "";

    contexto.registrarEmail(usuario.email);

    cy.then(() =>
      descreverCenario({
        id: "CT-API-01",
        epic: "API",
        feature: "Usuários",
        story: "Ciclo de vida do recurso /usuarios",
        severity: "critical",
        tags: ["api", "usuarios", "swagger", "crud"],
        description:
          "Exercita POST, GET, PUT e DELETE de /usuarios, inclusive e-mail duplicado e consulta após a exclusão, validando os schemas do Swagger.",
      }),
    );

    allure.step("Cadastrar um usuário com e-mail único", () => {
      allure.parameter("email", usuario.email);
      allure.parameter("administrador", usuario.administrador);

      return apis.usuarios.cadastrar(usuario).then((resposta) => {
        expect(resposta.status, "status do cadastro").to.eq(201);
        const corpo = validarContrato(cadastroComSucessoSchema, resposta.body, "cadastroComSucesso");
        expect(corpo.message, "mensagem de cadastro").to.eq(mensagens.cadastroSucesso);
        id = corpo._id;
        contexto.registrarUsuario(id);
      });
    });

    allure.step("Recusar um segundo cadastro com o mesmo e-mail", () =>
      apis.usuarios.cadastrar(usuario).then((resposta) => {
        expect(resposta.status, "status de e-mail duplicado").to.eq(400);
        const corpo = validarContrato(mensagemErroSchema, resposta.body, "errorEmailJaUtilizado");
        expect(corpo.message, "mensagem de e-mail em uso").to.eq(mensagens.emailEmUso);
      }),
    );

    allure.step("Buscar o usuário pelo id retornado no cadastro", () =>
      apis.usuarios.buscarPorId(id).then((resposta) => {
        expect(resposta.status, "status da consulta").to.eq(200);
        const corpo = validarContrato(usuarioSchema, resposta.body, "getUsuariosId");
        expect(corpo._id, "id consultado").to.eq(id);
        expect(corpo.nome, "nome consultado").to.eq(usuario.nome);
        expect(corpo.email, "e-mail consultado").to.eq(usuario.email);
        expect(corpo.password, "senha persistida").to.eq(usuario.password);
        expect(corpo.administrador, "perfil").to.eq("false");
      }),
    );

    allure.step("Listar usuários filtrando pelo e-mail", () =>
      apis.usuarios.listar({ email: usuario.email }).then((resposta) => {
        expect(resposta.status, "status da listagem").to.eq(200);
        const corpo = validarContrato(listaUsuariosSchema, resposta.body, "getUsuarios");
        expect(corpo.quantidade, "quantidade filtrada").to.eq(1);
        expect(corpo.usuarios[0]._id, "usuário da lista").to.eq(id);
      }),
    );

    allure.step("Alterar o nome do usuário", () => {
      const atualizado = { ...usuario, nome: nomeAlterado };

      return apis.usuarios.atualizar(id, atualizado).then((resposta) => {
        expect(resposta.status, "status da edição").to.eq(200);
        const corpo = validarContrato(alteradoComSucessoSchema, resposta.body, "alteradoComSucesso");
        expect(corpo.message, "mensagem de alteração").to.eq(mensagens.registroAlterado);
      });
    });

    allure.step("Confirmar o nome novo na consulta por id", () =>
      apis.usuarios.buscarPorId(id).then((resposta) => {
        expect(resposta.status, "status após edição").to.eq(200);
        const corpo = validarContrato(usuarioSchema, resposta.body, "getUsuariosId");
        expect(corpo.nome, "nome alterado").to.eq(nomeAlterado);
        expect(corpo.email, "e-mail preservado").to.eq(usuario.email);
      }),
    );

    allure.step("Excluir o usuário e não encontrá-lo depois", () =>
      apis.usuarios.excluir(id).then((exclusao) => {
        expect(exclusao.status, "status da exclusão").to.eq(200);
        const corpo = validarContrato(excluidoComSucessoSchema, exclusao.body, "registroExcluido");
        expect(corpo.message, "mensagem de exclusão").to.eq(mensagens.registroExcluido);

        return apis.usuarios.buscarPorId(id).then((consulta) => {
          expect(consulta.status, "status da consulta após exclusão").to.eq(400);
          const erro = validarContrato(mensagemErroSchema, consulta.body, "usuarioNaoEncontrado");
          expect(erro.message, "mensagem de usuário ausente").to.eq(mensagens.usuarioNaoEncontrado);
        });
      }),
    );
  });
});
