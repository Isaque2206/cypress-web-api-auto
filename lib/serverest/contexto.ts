import { ServeRestClient } from "./cliente";
import type { ProdutoCriado, RecursoCriado } from "./tipos";

interface UsuarioEncontrado {
  _id: string;
}

interface ListaUsuariosResposta {
  usuarios?: UsuarioEncontrado[];
}

/**
 * Rastreia os recursos criados no ServeRest público e os remove ao final
 * do cenário, cancelando carrinho antes de excluir usuário ou produto.
 */
export class ContextoDeTeste {
  private readonly emails: string[] = [];
  private readonly usuarios: RecursoCriado[] = [];
  private readonly produtos: ProdutoCriado[] = [];

  registrarEmail(email: string): void {
    this.emails.push(email);
  }

  registrarUsuario(id: string, token?: string): void {
    this.usuarios.push({ id, token });
  }

  registrarProduto(id: string, tokenAdmin: string): void {
    this.produtos.push({ id, tokenAdmin });
  }

  limpar(): Cypress.Chainable<null> {
    const cliente = new ServeRestClient();
    const emails = this.emails.splice(0);
    const usuarios = this.usuarios.splice(0);
    const produtos = this.produtos.splice(0);

    if (emails.length === 0 && usuarios.length === 0 && produtos.length === 0) {
      return cy.wrap<null>(null, { log: false });
    }

    const acumulado: RecursoCriado[] = [...usuarios];
    let descoberta: Cypress.Chainable<RecursoCriado[]> = cy.wrap(acumulado, { log: false });

    emails.forEach((email) => {
      descoberta = descoberta.then((lista) =>
        cliente
          .consultar("/usuarios", { qs: { email }, silencioso: true })
          .then((resposta) => {
            const corpo = resposta.body as ListaUsuariosResposta;
            const id = corpo.usuarios?.[0]?._id;
            if (id && !lista.some((item) => item.id === id)) {
              lista.push({ id });
            }
            return lista;
          }),
      );
    });

    return descoberta.then((lista) => {
      let cadeia = cy.wrap<null>(null, { log: false });
      const agendar = (passo: () => Cypress.Chainable<Cypress.Response<unknown>>) => {
        cadeia = cadeia.then(() => passo().then(() => null)) as typeof cadeia;
      };

      lista.forEach((usuario) => {
        if (!usuario.token) {
          return;
        }
        agendar(() =>
          cliente.excluir("/carrinhos/cancelar-compra", {
            token: usuario.token,
            silencioso: true,
          }),
        );
      });

      produtos.forEach((produto) => {
        agendar(() =>
          cliente.excluir(`/produtos/${produto.id}`, {
            token: produto.tokenAdmin,
            silencioso: true,
          }),
        );
      });

      lista.forEach((usuario) => {
        agendar(() => cliente.excluir(`/usuarios/${usuario.id}`, { silencioso: true }));
      });

      return cadeia;
    });
  }
}
