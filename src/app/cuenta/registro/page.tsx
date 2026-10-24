import { Suspense } from "react";
import { AuthScreen } from "@/components/app/auth/auth-screen";

export const metadata = { title: "Crear cuenta | Panamá Viajero" };

export default function Page() {
  return (
    <Suspense>
      <AuthScreen mode="register" />
    </Suspense>
  );
}
