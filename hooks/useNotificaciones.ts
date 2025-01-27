import { useState, useEffect } from "react";
import safeLocalStorage from "@/utils/safeLocalStorage";

interface Notificacion {
  id: number;
  mensaje: string;
  tipo: string;
  estado_envio: string;
  fecha_envio: string | null;
  created_at: string;
}

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      setLoading(true);
      try {
        const token = safeLocalStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notificaciones`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar las notificaciones.");
        }

        const data: Notificacion[] = await response.json();
        setNotificaciones(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, []);

  return { notificaciones, loading };
}
