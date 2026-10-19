import type { NovoProduto, ServeRestClient } from "../../../lib/serverest";

export class ProdutosApi {
  constructor(private readonly http: ServeRestClient) {}

  cadastrar(produto: NovoProduto, token?: string) {
    return this.http.criar("/produtos", produto, { token });
  }

  buscarPorId(id: string) {
    return this.http.consultar(`/produtos/${id}`);
  }

  listar(filtro: Record<string, string> = {}) {
    return this.http.consultar("/produtos", { qs: filtro });
  }

  atualizar(id: string, produto: NovoProduto, token: string) {
    return this.http.atualizar(`/produtos/${id}`, produto, { token });
  }

  excluir(id: string, token: string) {
    return this.http.excluir(`/produtos/${id}`, { token });
  }
}
