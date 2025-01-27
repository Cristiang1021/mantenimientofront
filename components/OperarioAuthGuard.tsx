"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import safeLocalStorage from "@/utils/safeLocalStorage";

interface OperarioAuthGuardProps {
  children: React.ReactNode;
}

export default function OperarioAuthGuard({ children }: OperarioAuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(safeLocalStorage.getItem("user") || "{}");

    // Verificar si el usuario está autenticado
    if (!user || !user.token) {
      console.error("Usuario no autenticado. Redirigiendo al login...");
      router.push("/login");
      return;
    }

    // Verificar si el usuario es operario (rol 2)
    if (user.role !== 2) {
      console.error(`Acceso denegado para el rol: ${user.role}`);
      router.push("/unauthorized");
      return;
    }
  }, [router]);

  return <>{children}</>;
}
