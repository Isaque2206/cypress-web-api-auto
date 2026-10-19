/**
 * Mensagens publicadas pelo Swagger e confirmadas na API do ServeRest.
 * Os testes importam daqui para a assertiva e o contrato não divergirem.
 */
export const mensagens = {
  cadastroSucesso: "Cadastro realizado com sucesso",
  loginSucesso: "Login realizado com sucesso",
  registroAlterado: "Registro alterado com sucesso",
  registroExcluido: "Registro excluído com sucesso",
  emailEmUso: "Este email já está sendo usado",
  credenciaisInvalidas: "Email e/ou senha inválidos",
  usuarioNaoEncontrado: "Usuário não encontrado",
  produtoNaoEncontrado: "Produto não encontrado",
  produtoNomeDuplicado: "Já existe produto com esse nome",
  rotaAdministradores: "Rota exclusiva para administradores",
  tokenAusente:
    "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais",
  usuarioComCarrinho: "Não é permitido excluir usuário com carrinho cadastrado",
  produtoEmCarrinho: "Não é permitido excluir produto que faz parte de carrinho",
  carrinhoDuplicado: "Não é permitido ter mais de 1 carrinho",
  compraConcluida: "Registro excluído com sucesso",
  compraCancelada: "Registro excluído com sucesso. Estoque dos produtos reabastecido",
  carrinhoInexistente: "Não foi encontrado carrinho para esse usuário",
  carrinhoVazio: "Seu carrinho está vazio",
} as const;
