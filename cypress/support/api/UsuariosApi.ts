import type { NovoUsuario, ServeRestClient } from "../../../lib/serverest";

export class UsuariosApi {
  constructor(private readonly http: ServeRestClient) {}

  cadastrar(usuario: NovoUsuario) {
    return this.http.criar("/usuarios", usuario);
  }

  buscarPorId(id: string) {
    return this.http.consultar(`/usuarios/${id}`);
  }

  listar(filtro: Record<string, string> = {}) {
    return this.http.consultar("/usuarios", { qs: filtro });
  }

  atualizar(id: string, usuario: NovoUsuario) {
    return this.http.atualizar(`/usuarios/${id}`, usuario);
  }

  excluir(id: string) {
    return this.http.excluir(`/usuarios/${id}`);
  }
}
