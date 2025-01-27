"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import safeLocalStorage from "@/utils/safeLocalStorage";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: number[]; // Roles opcionales
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(safeLocalStorage.getItem("user") || "{}");

    // Verificar si el usuario está autenticado
    if (!user || !user.token) {
      router.push("/login");
      return;
    }

    // Verificar roles si se especifican
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }
  }, [allowedRoles, router]);

  return <>{children}</>;
}
