export type Administrador = "true" | "false";

export interface NovoUsuario {
  nome: string;
  email: string;
  password: string;
  administrador: Administrador;
}

export interface NovoProduto {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
}

export interface ItemCarrinho {
  idProduto: string;
  quantidade: number;
}

export interface NovoCarrinho {
  produtos: ItemCarrinho[];
}

export interface RecursoCriado {
  id: string;
  token?: string;
}

export interface ProdutoCriado {
  id: string;
  tokenAdmin: string;
}
