"use client"

import React, { useEffect, useState } from "react"
import { Bell, LayoutDashboard, Wrench, Calendar, User, LogOut } from 'lucide-react'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Image from 'next/image'
import safeLocalStorage from "@/utils/safeLocalStorage";
type Usuario = {
  nombre: string
  email: string
  foto: string | null
}

type Resumen = {
  tareas_completadas: number
  tareas_pendientes: number
  tareas_en_progreso: number
  tareas_canceladas: number
}

type RendimientoSemanal = {
  day: string
  completadas: number
}

type Mantenimiento = {
  id_mantenimiento: string
  tipo_mantenimiento: string
  maquinaria: string
  fecha_mantenimiento: string
  tiempo_requerido: number
}

export default function OperarioDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<Usuario | null>(null)
  const [resumen, setResumen] = useState<Resumen>({
    tareas_completadas: 0,
    tareas_pendientes: 0,
    tareas_en_progreso: 0,
    tareas_canceladas: 0
  })
  const [rendimientoSemanal, setRendimientoSemanal] = useState<RendimientoSemanal[]>([])
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = safeLocalStorage.getItem("token")
        const response = await fetch(`${process.env.API_BASE_URL}/api/operario/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error("Error al obtener los datos: " + response.statusText)
        }
        const data = await response.json()
        setUser(data.usuario)
        setResumen(data.resumen)
        setRendimientoSemanal(data.rendimiento_semanal)
        setMantenimientos(data.mantenimientos)
      } catch (error) {
        console.error("Error de red:", error)
      }
    }

    fetchData()
  }, [])

  const Sidebar = () => (
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

  const Header = () => (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <h1 className="text-2xl font-bold">Dashboard del Operario</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notificaciones</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {user?.foto ? (
                    <AvatarImage src={`data:image/png;base64,${user.foto}`} alt={user.nombre} />
                  ) : (
                    <AvatarFallback>
                      {user?.nombre
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.nombre}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
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
  )

  const ResumenTareas = () => (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Tareas</CardTitle>
        <CardDescription>Tus tareas pendientes para la semana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span>Progreso semanal</span>
                <span>
                  {resumen.tareas_completadas}/{resumen.tareas_completadas + resumen.tareas_pendientes}{" "}
                  completadas
                </span>
              </div>
              <Progress
                value={(resumen.tareas_completadas / (resumen.tareas_completadas + resumen.tareas_pendientes)) * 100}
                className="h-2"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const EstadoMantenimientos = () => (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Mantenimientos</CardTitle>
        <CardDescription>Resumen de tus mantenimientos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Pendientes</span>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              {resumen.tareas_pendientes}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>En progreso</span>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {resumen.tareas_en_progreso}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Completados</span>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {resumen.tareas_completadas}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Cancelados</span>
            <Badge variant="outline" className="bg-red-100 text-red-800">
              {resumen.tareas_canceladas}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const RendimientoSemanal = () => (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento Semanal</CardTitle>
        <CardDescription>Tareas completadas por día</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rendimientoSemanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="completadas" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )

  const TareasAsignadas = () => (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Tareas Asignadas</CardTitle>
        <CardDescription>Tus tareas de mantenimiento pendientes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mantenimientos.length > 0 ? (
            mantenimientos.map((m) => (
              <div
                key={m.id_mantenimiento}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    Mantenimiento {m.tipo_mantenimiento} - {m.maquinaria}{" "}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Programado para{" "}
                    {new Date(m.fecha_mantenimiento).toLocaleDateString("es-ES")}{" "}
                    | Tiempo requerido {m.tiempo_requerido} horas
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/operario/mantenimiento/${m.id_mantenimiento}`)
                  }
                >
                  Ver detalles
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No tienes tareas asignadas.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ResumenTareas />
            <EstadoMantenimientos />
            <RendimientoSemanal />
          </div>
          <TareasAsignadas />
        </div>
      </main>
    </div>
  )
}