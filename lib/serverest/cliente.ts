import * as allure from "allure-js-commons";
import { enderecos } from "./enderecos";

type MetodoHttp = "GET" | "POST" | "PUT" | "DELETE";

export interface OpcoesRequisicao {
  corpo?: Cypress.RequestBody;
  qs?: Record<string, string | number | boolean>;
  token?: string;
  silencioso?: boolean;
}

export class ServeRestClient {
  constructor(private readonly baseUrl = enderecos.api) {}

  consultar(caminho: string, opcoes: OpcoesRequisicao = {}) {
    return this.enviar("GET", caminho, opcoes);
  }

  criar(caminho: string, corpo: Cypress.RequestBody, opcoes: OpcoesRequisicao = {}) {
    return this.enviar("POST", caminho, { ...opcoes, corpo });
  }

  atualizar(caminho: string, corpo: Cypress.RequestBody, opcoes: OpcoesRequisicao = {}) {
    return this.enviar("PUT", caminho, { ...opcoes, corpo });
  }

  excluir(caminho: string, opcoes: OpcoesRequisicao = {}) {
    return this.enviar("DELETE", caminho, opcoes);
  }

  private enviar(
    metodo: MetodoHttp,
    caminho: string,
    opcoes: OpcoesRequisicao,
  ): Cypress.Chainable<Cypress.Response<unknown>> {
    return cy
      .request<unknown>({
        method: metodo,
        url: `${this.baseUrl}${caminho}`,
        qs: opcoes.qs,
        body: opcoes.corpo,
        failOnStatusCode: false,
        headers: {
          Accept: "application/json",
          ...(opcoes.token ? { Authorization: opcoes.token } : {}),
        },
      })
      .then((resposta) => {
        if (opcoes.silencioso) {
          return cy.wrap(resposta, { log: false });
        }

        return cy
          .then(() =>
            allure.attachment(
              `${metodo} ${caminho} [${resposta.status}]`,
              JSON.stringify(resposta.body ?? {}, null, 2),
              { contentType: "application/json" },
            ),
          )
          .then(() => resposta);
      });
  }
}
