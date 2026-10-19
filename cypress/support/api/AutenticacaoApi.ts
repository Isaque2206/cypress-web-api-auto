import type { NovoUsuario, ServeRestClient } from "../../../lib/serverest";

export class AutenticacaoApi {
  constructor(private readonly http: ServeRestClient) {}

  entrar(email: string, password: string) {
    return this.http.criar("/login", { email, password });
  }

  entrarCom(usuario: Pick<NovoUsuario, "email" | "password">) {
    return this.entrar(usuario.email, usuario.password);
  }
}
