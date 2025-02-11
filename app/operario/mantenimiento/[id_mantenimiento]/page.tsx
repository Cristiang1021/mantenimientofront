"use client"

import React, { useEffect, useState, useCallback } from "react"
import { AlertCircle, Calendar, Clock, Bell, LayoutDashboard, Wrench, LogOut, User } from 'lucide-react'
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Mantenimiento = {
  id_mantenimiento: string
  tipo_mantenimiento: string
  fecha_mantenimiento: string
  tiempo_requerido: number
  descripcion: string
  estado_actual: string
  observacion: string
  herramientas: Array<{
    id_herramienta: string
    nombre: string
    cantidad_usada: number
  }>
}

type Maquinaria = {
  nombre: string
  modelo: string
  numero_serie: string
  ultima_revision: string
  descripcion: string
  imagen: string | null
}

type Perfil = {
  nombre: string
  email: string
  foto: string | null
}

export default function DetallesMantenimiento() {
  //const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [mantenimiento, setMantenimiento] = useState<Mantenimiento | null>(null)
  const [maquinaria, setMaquinaria] = useState<Maquinaria | null>(null)
  const [estado, setEstado] = useState("")
  const [observacion, setObservacion] = useState("")
  const [perfil, setPerfil] = useState<Perfil>({
    nombre: "Operario",
    email: "",
    foto: null,
  })

  const showToast = useCallback((title: string, description: string, type: "success" | "error") => {
    const toastStyles = {
      success: "bg-green-100 text-green-800 border-green-500",
      error: "bg-red-100 text-red-800 border-red-500",
    }

    toast({
      title,
      description,
      className: `flex items-center justify-center border-l-4 rounded-lg shadow-lg p-4 transition-all duration-300 ${toastStyles[type]} mx-auto`,
    })
  }, [toast])

  useEffect(() => {
    const fetchDetalles = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(
          `${process.env.API_BASE_URL}/managment/${params.id_mantenimiento}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (!response.ok) {
          throw new Error("No se pudo obtener los detalles del mantenimiento.")
        }

        const data = await response.json()
        setMantenimiento(data.mantenimiento)
        setMaquinaria(data.maquinaria)
        setEstado(data.mantenimiento.estado_actual)
        setObservacion(data.mantenimiento.observacion || "")
      } catch (error) {
        showToast("Error", error instanceof Error ? error.message : "Error desconocido", "error")
      }
    }

    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.API_BASE_URL}/api/operario/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error("No se pudo obtener el perfil del operario.")
        }

        const data = await response.json()
        setPerfil(data)
      } catch (error) {
        showToast("Error", error instanceof Error ? error.message : "Error desconocido", "error")
      }
    }

    fetchDetalles()
    fetchPerfil()
  }, [params.id_mantenimiento, showToast])

  const handleEmpezarMantenimiento = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.API_BASE_URL}/managment/${params.id_mantenimiento}/actualizar-estado`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: "En progreso", observacion: "Se ha iniciado el mantenimiento" }),
        }
      )

      if (!response.ok) {
        throw new Error("No se pudo iniciar el mantenimiento.")
      }

      const data = await response.json()
      setEstado(data.estado)
      showToast("Éxito", "El mantenimiento ha empezado.", "success")
    } catch (error) {
      showToast("Error", error instanceof Error ? error.message : "Error desconocido", "error")
    }
  }

  const handleGuardarEstado = async (localObservacion: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.API_BASE_URL}/managment/${params.id_mantenimiento}/actualizar-estado`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado, observacion: localObservacion }),
        }
      )

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado.")
      }

      setObservacion(localObservacion);
      showToast("Éxito", "Estado y observaciones actualizados correctamente.", "success")
    } catch (error) {
      showToast("Error", error instanceof Error ? error.message : "Error desconocido", "error")
    }
  }

  if (!mantenimiento || !maquinaria) return <p>Cargando...</p>

  return (
    <div className="flex h-screen">
      <Toaster />
      <Sidebar />
      <main className="flex-1 bg-gray-100">
        <Header perfil={perfil} estado={estado} />
        <div className="container mx-auto p-8">
          <div className="grid gap-8 md:grid-cols-3">
            <MaintenanceInfo 
              mantenimiento={mantenimiento}
              maquinaria={maquinaria}
              estado={estado}
              setEstado={setEstado}
              observacion={observacion}
              handleEmpezarMantenimiento={handleEmpezarMantenimiento}
              handleGuardarEstado={handleGuardarEstado}
            />
            <MachineInfo maquinaria={maquinaria} />
          </div>
        </div>
      </main>
    </div>
  )
}

const Sidebar = () => {
  const router = useRouter()
  return (
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
  )
}

const Header = ({ perfil, estado }: { perfil: Perfil, estado: string }) => {
  const router = useRouter()
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <h1 className="text-2xl font-bold">Dashboard del Mantenimiento</h1>
        <Badge
          variant={estado === "pendiente" ? "default" : "secondary"}
          className="text-lg"
        >
          {estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()}
        </Badge>
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
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{perfil.nombre}</p>
                  <p className="text-xs leading-none text-muted-foreground">{perfil.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/operario/perfil")}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("token")
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
  )
}

const MaintenanceInfo = ({ 
  mantenimiento, 
  maquinaria, 
  estado, 
  setEstado, 
  observacion, 
  handleEmpezarMantenimiento, 
  handleGuardarEstado 
}: { 
  mantenimiento: Mantenimiento
  maquinaria: Maquinaria
  estado: string
  setEstado: React.Dispatch<React.SetStateAction<string>>
  observacion: string
  handleEmpezarMantenimiento: () => Promise<void>
  handleGuardarEstado: (localObservacion: string) => Promise<void>
}) => {
  const [localObservacion, setLocalObservacion] = useState(observacion);

  useEffect(() => {
    setLocalObservacion(observacion);
  }, [observacion]);

  const handleObservacionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalObservacion(e.target.value);
  };

  const handleSubmit = () => {
    handleGuardarEstado(localObservacion);
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>
          {mantenimiento.tipo_mantenimiento} - {maquinaria.nombre}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Fecha:{" "}
              {new Date(mantenimiento.fecha_mantenimiento).toLocaleDateString(
                "es-ES"
              )}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Duración: {mantenimiento.tiempo_requerido} horas</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span>Prioridad: Alta</span>
          </div>
        </div>
        <Separator className="my-4" />
        <div>
          <h3 className="font-semibold mb-2">Descripción</h3>
          <p>{mantenimiento.descripcion}</p>
        </div>
        <Separator className="my-4" />
        <div>
          <h3 className="font-bold mb-2">Herramientas Asignadas</h3>
          {mantenimiento.herramientas.length > 0 ? (
            <ul className="list-disc pl-5">
              {mantenimiento.herramientas.map((herramienta) => (
                <li key={herramienta.id_herramienta}>
                  {herramienta.nombre} - {herramienta.cantidad_usada}{" "}
                  unidades
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay herramientas asignadas.
            </p>
          )}
        </div>
        <Separator className="my-4" />
        <div className="mt-4 space-y-4">
          {estado === "pendiente" ? (
            <Button onClick={handleEmpezarMantenimiento}>
              Empezar Mantenimiento
            </Button>
          ) : (
            <>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En progreso">En Progreso</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Añadir observaciones..."
                value={localObservacion}
                onChange={handleObservacionChange}
              />
              <Button className="mt-4" onClick={handleSubmit}>
                Guardar Estado
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MachineInfo = ({ maquinaria }: { maquinaria: Maquinaria }) => (
  <Card>
    <CardHeader>
      <CardTitle>Información de la Maquinaria</CardTitle>
    </CardHeader>
    <CardContent>
      {maquinaria.imagen && (
        <div className="aspect-square relative overflow-hidden rounded-lg">
          <Image
            src={`data:image/png;base64,${maquinaria.imagen}`}
            alt={`Imagen de ${maquinaria.nombre}`}
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}
      <div className="space-y-2 mt-4">
        <div className="flex justify-between">
          <span className="font-medium">Modelo:</span>
          <span>{maquinaria.modelo}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Número de Serie:</span>
          <span>{maquinaria.numero_serie}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Última Revisión:</span>
          <span>{maquinaria.ultima_revision}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {maquinaria.descripcion}
        </p>
      </div>
    </CardContent>
  </Card>
)