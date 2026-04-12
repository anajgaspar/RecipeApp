import { isAxiosError } from "axios";

export function getFriendlyHttpErrorMessage(error: unknown, fallbackMessage: string): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão e se os serviços estão ativos.";
    }

    const status = error.response.status;
    const responseMessage =
      (error.response.data as { error?: string } | undefined)?.error ??
      (error.response.data as { message?: string } | undefined)?.message;

    if (status === 413) {
      return responseMessage ?? "A imagem é maior que o permitido. Tente uma imagem menor ou mais comprimida.";
    }

    if (responseMessage && responseMessage.trim().length > 0) {
      return responseMessage;
    }

    if (error.message && error.message.trim().length > 0) {
      return "Não foi possível concluir a requisição. Tente novamente em instantes.";
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}
