"use client"

import React, { useEffect, useState } from "react"
import { Bell, LayoutDashboard, Wrench, Calendar, User, Cog, LogOut } from 'lucide-react'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Toaster } from "@/components/ui/toaster"
import Image from 'next/image'
import safeLocalStorage from "@/utils/safeLocalStorage";
type Perfil = {
  nombre: string
  email: string
  telefono: string
  cedula: string
  titulo: string
  foto: string | null
}

type Contacto = {
  nombre: string
  direccion: string
  celular: string
  parentesco: string
}

export default function OperarioPerfil() {
  const router = useRouter()
  const { toast } = useToast()
  const [perfil, setPerfil] = useState<Perfil>({
    nombre: "",
    email: "",
    telefono: "",
    cedula: "",
    titulo: "",
    foto: null,
  })
  const [contacto, setContacto] = useState<Contacto>({
    nombre: "",
    direccion: "",
    celular: "",
    parentesco: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = safeLocalStorage.getItem("token")
        if (!token) {
          toast({
            title: "Error",
            description: "Token no encontrado. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        const [perfilResponse, contactoResponse] = await Promise.all([
          fetch(`${process.env.API_BASE_URL}/api/operario/perfil`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.API_BASE_URL}/api/operario/contacto`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (perfilResponse.ok && contactoResponse.ok) {
          const perfilData = await perfilResponse.json()
          const contactoData = await contactoResponse.json()
          setPerfil(perfilData)
          setContacto(contactoData)
        } else {
          throw new Error("No se pudo cargar la información.")
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [router, toast])

  const handleGuardarPerfil = async () => {
    try {
      const token = safeLocalStorage.getItem("token")
      const response = await fetch(`${process.env.API_BASE_URL}/api/operario/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(perfil),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Perfil actualizado correctamente.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.mensaje || "No se pudo actualizar el perfil.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      })
      console.error("Error al actualizar el perfil:", error)
    }
  }

  const handleGuardarContacto = async () => {
    try {
      const token = safeLocalStorage.getItem("token")
      const response = await fetch(`${process.env.API_BASE_URL}/api/operario/contacto`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contacto),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "El contacto de emergencia se actualizó correctamente.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error al guardar",
          description: errorData.mensaje || "No se pudo guardar los cambios.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al guardar los cambios. Intenta nuevamente.",
        variant: "destructive",
      })
      console.error("Error al actualizar el contacto:", error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster />
      {/* Menú lateral */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Logo" width={120} height={120} />
          </div>
        </div>
        <nav className="mt-6 space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/operario/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/operario/mantenimientos")}>
            <Wrench className="mr-2 h-4 w-4" />
            Mantenimientos
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/operario/historial")}>
            <Calendar className="mr-2 h-4 w-4" />
            Historial de mantenimientos
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/operario/calendario")}>
            <Calendar className="mr-2 h-4 w-4" />
            Calendario de mantenimientos
          </Button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-2xl font-bold">Perfil del Operario</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notificaciones</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {perfil.foto ? (
                        <AvatarImage src={`data:image/png;base64,${perfil.foto}`} alt={perfil.nombre} />
                      ) : (
                        <AvatarFallback>{perfil.nombre[0]}</AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{perfil.nombre}</p>
                      <p className="text-xs text-muted-foreground">{perfil.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/operario/perfil")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/operario/configuracion")}>
                    <Cog className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      safeLocalStorage.removeItem("token")
                      router.push("/login")
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <div className="p-8 space-y-8">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`data:image/png;base64,${perfil.foto}`} alt={perfil.nombre} />
              <AvatarFallback>{perfil.nombre[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{perfil.nombre}</h2>
              <p className="text-gray-600">{perfil.titulo}</p>
            </div>
          </div>

          <Tabs defaultValue="info">
            <TabsList className="space-x-2">
              <TabsTrigger value="info">Información Personal</TabsTrigger>
              <TabsTrigger value="contacto">Contacto de Emergencia</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={perfil.nombre}
                    onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Correo Electrónico</Label>
                  <Input
                    value={perfil.email}
                    onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={perfil.telefono}
                    onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cédula</Label>
                  <Input
                    value={perfil.cedula}
                    onChange={(e) => setPerfil({ ...perfil, cedula: e.target.value })}
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={handleGuardarPerfil}>
                Guardar cambios
              </Button>
            </TabsContent>

            <TabsContent value="contacto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={contacto.nombre}
                    onChange={(e) => setContacto({ ...contacto, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Dirección</Label>
                  <Input
                    value={contacto.direccion}
                    onChange={(e) => setContacto({ ...contacto, direccion: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={contacto.celular}
                    onChange={(e) => setContacto({ ...contacto, celular: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Parentesco</Label>
                  <Input
                    value={contacto.parentesco}
                    onChange={(e) => setContacto({ ...contacto, parentesco: e.target.value })}
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={handleGuardarContacto}>
                Guardar cambios
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}