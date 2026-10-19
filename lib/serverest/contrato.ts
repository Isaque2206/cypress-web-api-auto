import { z } from "zod";

function detalhar(erro: z.ZodError): string {
  return erro.issues
    .map((item) => {
      const caminho = item.path.length > 0 ? item.path.join(".") : "raiz";
      return `${caminho}: ${item.message}`;
    })
    .join(" | ");
}

/**
 * Confere o corpo da resposta contra o schema derivado do Swagger.
 * A falha cita o componente do contrato para o relatório apontar o desvio.
 */
export function validarContrato<T>(
  schema: z.ZodType<T>,
  dados: unknown,
  nomeDoContrato: string,
): T {
  const resultado = schema.safeParse(dados);

  if (!resultado.success) {
    expect.fail(
      `Contrato Swagger "${nomeDoContrato}" rejeitou a resposta: ${detalhar(resultado.error)}`,
    );
  }

  return resultado.data;
}
