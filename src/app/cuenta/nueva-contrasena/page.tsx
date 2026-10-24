import { Suspense } from "react";
import { AuthScreen } from "@/components/app/auth/auth-screen";

export const metadata = { title: "Nueva contraseña | Panamá Viajero" };

export default function Page() {
  return (
    <Suspense>
      <AuthScreen mode="recovery" />
    </Suspense>
  );
}
