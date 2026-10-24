// Ejecuta una carga de datos y devuelve el error como texto, para mostrar el estado de error
// de la app sin construir JSX dentro de try/catch.
export async function attempt<T>(
  load: () => Promise<T>,
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    return { data: await load(), error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Error de conexión" };
  }
}
