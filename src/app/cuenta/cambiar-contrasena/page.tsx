import { Suspense } from "react";
import { AuthScreen } from "@/components/app/auth/auth-screen";

export const metadata = { title: "Cambiar contraseña | Panamá Viajero" };

export default function Page() {
  return (
    <Suspense>
      <AuthScreen mode="change-password" />
    </Suspense>
  );
}
