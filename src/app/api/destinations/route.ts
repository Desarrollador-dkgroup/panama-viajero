import { NextResponse } from "next/server";
import { getDestinations } from "@/lib/destinations";

// Devuelve los destinos del panel para las páginas que se cargan en el navegador.
export async function GET() {
  try {
    return NextResponse.json({ destinations: await getDestinations() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de conexión";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
