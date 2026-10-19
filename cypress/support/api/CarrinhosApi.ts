import type { NovoCarrinho, ServeRestClient } from "../../../lib/serverest";

export class CarrinhosApi {
  constructor(private readonly http: ServeRestClient) {}

  cadastrar(carrinho: NovoCarrinho, token: string) {
    return this.http.criar("/carrinhos", carrinho, { token });
  }

  buscarPorId(id: string) {
    return this.http.consultar(`/carrinhos/${id}`);
  }

  listar(filtro: Record<string, string> = {}) {
    return this.http.consultar("/carrinhos", { qs: filtro });
  }

  concluirCompra(token: string) {
    return this.http.excluir("/carrinhos/concluir-compra", { token });
  }

  cancelarCompra(token: string) {
    return this.http.excluir("/carrinhos/cancelar-compra", { token });
  }
}
