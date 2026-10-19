import { ServeRestClient } from "../../../lib/serverest";
import { AutenticacaoApi } from "./AutenticacaoApi";
import { CarrinhosApi } from "./CarrinhosApi";
import { ProdutosApi } from "./ProdutosApi";
import { UsuariosApi } from "./UsuariosApi";

export function criarApis() {
  const http = new ServeRestClient();

  return {
    autenticacao: new AutenticacaoApi(http),
    usuarios: new UsuariosApi(http),
    produtos: new ProdutosApi(http),
    carrinhos: new CarrinhosApi(http),
  };
}

export { AutenticacaoApi, CarrinhosApi, ProdutosApi, UsuariosApi };
