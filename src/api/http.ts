import { REQUEST_TIMEOUT_MS } from "../utils/constants.ts";

export async function fetchJson(url: URL): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error(
        "Tiempo de espera agotado al conectar con Open-Meteo. Revisa tu conexión, VPN o firewall.",
      );
    }

    const message = error instanceof Error ? error.message : "Error desconocido";
    throw new Error(`No se pudo conectar con Open-Meteo: ${message}`);
  }

  if (!response.ok) {
    throw new Error(`La API respondió con el estado ${response.status}.`);
  }

  return response.json();
}
