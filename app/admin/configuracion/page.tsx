"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import API_BASE_URL from "@/config"; // Asegúrate de que esta constante esté configurada correctamente
import { Toaster } from "@/components/ui/toaster";
import safeLocalStorage from "@/utils/safeLocalStorage";

interface Configuracion {
  email: string;
  smtp_server: string;
  smtp_port: string;
  smtp_password: string;
}

export default function ConfiguracionNotificaciones() {
  const [configuracion, setConfiguracion] = useState<Configuracion>({
    email: "",
    smtp_server: "",
    smtp_port: "",
    smtp_password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [emptyConfig, setEmptyConfig] = useState<boolean>(false);

  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        const token = safeLocalStorage.getItem("token");

        const response = await fetch(`${process.env.API_BASE_URL}/api/admin/config-notificaciones`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 404) {
          setEmptyConfig(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Error al cargar la configuración.");
        }

        const data: Configuracion = await response.json();
        setConfiguracion(data);
      } catch (error) {
        const errorMessage = (error as Error).message || "No se pudo cargar la configuración.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    fetchConfiguracion();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfiguracion(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const { email, smtp_server, smtp_port, smtp_password } = configuracion;

    if (!email || !smtp_server || !smtp_port || !smtp_password) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos antes de guardar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = safeLocalStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/config-notificaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(configuracion),
      });

      if (!response.ok) {
        throw new Error("Error al guardar la configuración.");
      }

      toast({
        title: "Éxito",
        description: "Configuración guardada correctamente.",
        variant: "default",
      });
      setEmptyConfig(false);
    } catch (error) {
      const errorMessage = (error as Error).message || "No se pudo guardar la configuración.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    try {
      const token = safeLocalStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/test-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipient: configuracion.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al probar el correo.");
      }

      const data = await response.json();
      toast({
        title: "Éxito",
        description: data.message,
        variant: "default",
      });
    } catch (error) {
      const errorMessage = (error as Error).message || "No se pudo enviar el correo de prueba.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        Configuración de Notificaciones
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
              <span className="sr-only">Información</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Cómo obtener estos datos?</DialogTitle>
              <DialogDescription>
                <ul className="list-disc ml-6">
                  <li>
                    <strong>Correo:</strong> Utiliza un correo habilitado para SMTP. Por ejemplo:
                    <ul className="list-disc ml-6">
                      <li><strong>Gmail:</strong> Genera una contraseña de aplicación.</li>
                      <li><strong>Outlook:</strong> Habilita SMTP desde la configuración.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Servidor SMTP:</strong> Ejemplo:
                    <ul className="list-disc ml-6">
                      <li><strong>Gmail:</strong> smtp.gmail.com</li>
                      <li><strong>Outlook:</strong> smtp.office365.com</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Puerto:</strong> Usa 587 para TLS o 465 para SSL.
                  </li>
                  <li>
                    <strong>Contraseña:</strong> Es la contraseña o token SMTP generado.
                  </li>
                </ul>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </h1>

      {emptyConfig && (
      <div className="mb-4 text-red-500">
        No se encontró ninguna configuración. Por favor, ingresa los datos necesarios.
      </div>
    )}
    
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Correo remitente:</Label>
              <Input
                id="email"
                name="email"
                value={configuracion.email}
                onChange={handleChange}
                placeholder="ejemplo@empresa.com"
              />
            </div>
            <div>
              <Label htmlFor="smtp_server">Servidor SMTP:</Label>
              <Input
                id="smtp_server"
                name="smtp_server"
                value={configuracion.smtp_server}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="smtp_port">Puerto SMTP:</Label>
              <Input
                id="smtp_port"
                name="smtp_port"
                type="number"
                value={configuracion.smtp_port}
                onChange={handleChange}
                placeholder="587"
              />
            </div>
            <div>
              <Label htmlFor="smtp_password">Contraseña o Token SMTP:</Label>
              <Input
                id="smtp_password"
                name="smtp_password"
                type="password"
                value={configuracion.smtp_password}
                onChange={handleChange}
                placeholder="Contraseña o Token"
              />
            </div>
            <div className="flex gap-4 mt-4">
              <Button onClick={handleSave} disabled={loading}>
                Guardar Configuración
              </Button>
              <Button onClick={handleTestEmail} variant="outline" disabled={loading}>
                Probar Correo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}