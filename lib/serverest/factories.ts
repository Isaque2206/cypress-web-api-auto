import { faker } from "@faker-js/faker/locale/pt_BR";
import type { NovoProduto, NovoUsuario } from "./tipos";

function sufixo(): string {
  return faker.string.alphanumeric({ length: 10, casing: "lower" });
}

export function criarUsuario(parcial: Partial<NovoUsuario> = {}): NovoUsuario {
  const identificador = sufixo();

  return {
    nome: faker.person.fullName(),
    email: `qa.${identificador}@qa.com.br`,
    password: faker.string.alphanumeric({ length: 12 }),
    administrador: "false",
    ...parcial,
  };
}

export function criarProduto(parcial: Partial<NovoProduto> = {}): NovoProduto {
  const identificador = sufixo();

  return {
    nome: `ProdutoQA${identificador}`,
    preco: faker.number.int({ min: 15, max: 480 }),
    descricao: `Item de automacao ${identificador}`,
    quantidade: faker.number.int({ min: 5, max: 12 }),
    ...parcial,
  };
}
