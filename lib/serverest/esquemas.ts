import { z } from "zod";
import { mensagens } from "./mensagens";

const idSchema = z.string().min(1);
const administradorSchema = z.enum(["true", "false"]);

export const cadastroComSucessoSchema = z.object({
  message: z.literal(mensagens.cadastroSucesso),
  _id: idSchema,
});

export const loginComSucessoSchema = z.object({
  message: z.literal(mensagens.loginSucesso),
  authorization: z.string().startsWith("Bearer "),
});

export const alteradoComSucessoSchema = z.object({
  message: z.literal(mensagens.registroAlterado),
});

export const excluidoComSucessoSchema = z.object({
  message: z.string().min(1),
});

export const mensagemErroSchema = z.object({
  message: z.string().min(1),
});

export const usuarioSchema = z.object({
  nome: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
  administrador: administradorSchema,
  _id: idSchema,
});

export const listaUsuariosSchema = z.object({
  quantidade: z.number().int().nonnegative(),
  usuarios: z.array(usuarioSchema),
});

export const produtoSchema = z.object({
  nome: z.string().min(1),
  preco: z.number().int().nonnegative(),
  descricao: z.string().min(1),
  quantidade: z.number().int().nonnegative(),
  _id: idSchema,
});

export const listaProdutosSchema = z.object({
  quantidade: z.number().int().nonnegative(),
  produtos: z.array(produtoSchema),
});

export const itemCarrinhoPersistidoSchema = z.object({
  idProduto: idSchema,
  quantidade: z.number().int().positive(),
  precoUnitario: z.number().int().nonnegative(),
});

export const carrinhoSchema = z.object({
  produtos: z.array(itemCarrinhoPersistidoSchema).min(1),
  precoTotal: z.number().int().nonnegative(),
  quantidadeTotal: z.number().int().positive(),
  idUsuario: idSchema,
  _id: idSchema,
});

export const listaCarrinhosSchema = z.object({
  quantidade: z.number().int().nonnegative(),
  carrinhos: z.array(carrinhoSchema),
});

export const erroUsuarioComCarrinhoSchema = z.object({
  message: z.literal(mensagens.usuarioComCarrinho),
  idCarrinho: idSchema,
});

export const erroProdutoEmCarrinhoSchema = z.object({
  message: z.literal(mensagens.produtoEmCarrinho),
  idCarrinhos: z.array(idSchema).min(1),
});

export type CadastroComSucesso = z.infer<typeof cadastroComSucessoSchema>;
export type LoginComSucesso = z.infer<typeof loginComSucessoSchema>;
export type Usuario = z.infer<typeof usuarioSchema>;
export type ListaUsuarios = z.infer<typeof listaUsuariosSchema>;
export type Produto = z.infer<typeof produtoSchema>;
export type ListaProdutos = z.infer<typeof listaProdutosSchema>;
export type Carrinho = z.infer<typeof carrinhoSchema>;
export type MensagemErro = z.infer<typeof mensagemErroSchema>;
