"use client"

import React, { useState, useEffect } from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, List, Bell, LayoutDashboard, Wrench, LogOut, User, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import safeLocalStorage from "@/utils/safeLocalStorage";

type Mantenimiento = {
  id: string
  maquina: string
  tipo: string
  fecha: Date
  duracion: number
  estado: 'pendiente' | 'en proceso' | 'completado'
}

type Perfil = {
  nombre: string
  foto: string | null
  email: string
}

export default function CalendarioOperario() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"mes" | "lista">("mes")
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])
  const [perfil, setPerfil] = useState<Perfil>({
    nombre: "Operario",
    foto: null,
    email: "",
  })
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const fetchMantenimientos = async () => {
    try {
      const token = safeLocalStorage.getItem("token")
      const response = await fetch(`${process.env.API_BASE_URL}/api/operario/calendario`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Error al cargar los mantenimientos.")
      
      const data = await response.json()
      const formattedData = data
        .map((mantenimiento: Omit<Mantenimiento, 'fecha'> & { fecha: string }) => ({
          ...mantenimiento,
          fecha: new Date(mantenimiento.fecha),
        }))
        .filter((m: Mantenimiento) => m.fecha >= new Date())
      setMantenimientos(formattedData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    }
  }

  const fetchPerfil = async () => {
    try {
      const token = safeLocalStorage.getItem("token")
      const response = await fetch(`${process.env.API_BASE_URL}/api/operario/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Error al cargar el perfil.")

      const data = await response.json()
      setPerfil({
        nombre: data.nombre,
        foto: data.foto,
        email: data.email,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchMantenimientos()
    fetchPerfil()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 

  const filteredMantenimientos = mantenimientos
    .filter(
      (m) =>
        m.maquina.toLowerCase().includes(search.toLowerCase()) ||
        m.tipo.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())

  const paginatedMantenimientos = filteredMantenimientos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

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
                  {perfil?.foto ? (
                    <AvatarImage src={`data:image/png;base64,${perfil.foto}`} alt={perfil.nombre} />
                  ) : (
                    <AvatarFallback>
                      {perfil?.nombre
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
                  <p className="text-sm font-medium leading-none">{perfil?.nombre}</p>
                  <p className="text-xs leading-none text-muted-foreground">{perfil?.email}</p>
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

  const CalendarHeader = () => (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === "mes" ? "default" : "outline"}
            onClick={() => setView("mes")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Mes
          </Button>
          <Button
            variant={view === "lista" ? "default" : "outline"}
            onClick={() => setView("lista")}
          >
            <List className="mr-2 h-4 w-4" />
            Lista
          </Button>
        </div>
      </div>
    </header>
  )

  const MonthView = () => (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-4">
          {diasSemana.map((dia, index) => (
            <div key={index} className="text-center font-semibold">
              {dia}
            </div>
          ))}
          {Array.from({ length: getDay(monthStart) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="h-20 bg-secondary/20 rounded-md"
            ></div>
          ))}
          {monthDays.map((day) => (
            <Card key={day.toISOString()} className="h-20 overflow-hidden">
              <CardHeader className="p-2">
                <CardTitle className="text-center text-sm">
                  {format(day, "d", { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                {filteredMantenimientos
                  .filter(
                    (m) =>
                      m.fecha.getDate() === day.getDate() &&
                      m.fecha.getMonth() === day.getMonth()
                  )
                  .map((mantenimiento) => (
                    <div
                      key={mantenimiento.id}
                      className="mb-1 p-1 bg-secondary text-secondary-foreground rounded-sm text-xs"
                    >
                      <div className="font-semibold truncate">
                        {mantenimiento.maquina}
                      </div>
                      <div>{mantenimiento.duracion} min</div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const ListView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Mantenimientos</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Buscar por máquina o tipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">Máquina</th>
              <th className="border-b p-2 text-left">Tipo</th>
              <th className="border-b p-2 text-left">Fecha</th>
              <th className="border-b p-2 text-left">Duración</th>
              <th className="border-b p-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMantenimientos.map((mantenimiento) => (
              <tr key={mantenimiento.id}>
                <td className="border-b p-2">{mantenimiento.maquina}</td>
                <td className="border-b p-2">{mantenimiento.tipo}</td>
                <td className="border-b p-2">
                  {format(mantenimiento.fecha, "dd/MM/yyyy")}
                </td>
                <td className="border-b p-2">{mantenimiento.duracion} min</td>
                <td className="border-b p-2">
                  <Badge
                    variant={
                      mantenimiento.estado === "pendiente"
                        ? "default"
                        : mantenimiento.estado === "en proceso"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {mantenimiento.estado}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Anterior
          </Button>
          <span>
            Página {currentPage} de{" "}
            {Math.ceil(filteredMantenimientos.length / itemsPerPage)}
          </span>
          <Button
            variant="outline"
            disabled={
              currentPage ===
              Math.ceil(filteredMantenimientos.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Siguiente
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen">
      <Toaster />
      <Sidebar />
      <main className="flex-1 bg-gray-100">
        <Header />
        <CalendarHeader />
        <div className="container mx-auto p-6">
          {view === "mes" ? <MonthView /> : <ListView />}
        </div>
      </main>
    </div>
  )
}