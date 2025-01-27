"use client"

import React, { useEffect, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock, Wrench, ShieldCheck, LayoutDashboard, Bell, LogOut, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
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
import Image from 'next/image'
import safeLocalStorage from "@/utils/safeLocalStorage";
type Mantenimiento = {
  id_mantenimiento: string
  maquina: string
  tipo_mantenimiento: string
  fecha_programada: string
  duracion: string
  estado: string
  observaciones: string
}

type Perfil = {
  nombre: string
  foto: string | null
}

export default function HistorialMantenimientosOperario() {
  const router = useRouter()
  const { toast } = useToast()
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [perfil, setPerfil] = useState<Perfil>({
    nombre: "Operario",
    foto: null,
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const token = safeLocalStorage.getItem("token")
        const response = await fetch(`${process.env.API_BASE_URL}/api/operario/historial`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("No se pudo obtener el historial de mantenimientos.")
        }

        const data = await response.json()
        setMantenimientos(data.historial || [])
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchPerfil = async () => {
      try {
        const token = safeLocalStorage.getItem("token")
        const response = await fetch(`${process.env.API_BASE_URL}/api/operario/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("No se pudo obtener el perfil del operario.")
        }

        const data = await response.json()
        setPerfil({
          nombre: data.nombre,
          foto: data.foto,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        })
      }
    }

    fetchHistorial()
    fetchPerfil()
  }, [toast])

  const filteredMantenimientos = mantenimientos
    .filter((m) => m.estado !== "En progreso")
    .filter((m) => {
      const matchesSearch = m.maquina.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter =
        filter === "all" || m.tipo_mantenimiento.toLowerCase() === filter.toLowerCase()
      return matchesSearch && matchesFilter
    })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentMantenimientos = filteredMantenimientos.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredMantenimientos.length / itemsPerPage)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

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
        <h1 className="text-2xl font-bold">Historial de Mantenimientos</h1>
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

  const SummaryCards = () => (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Mantenimientos</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mantenimientos.length}</div>
          <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mantenimientos.length > 0
              ? (
                  mantenimientos.reduce((total, m) => total + parseFloat(m.duracion.split(" ")[0]), 0) /
                  mantenimientos.length
                ).toFixed(1)
              : "0"}{" "}
            horas
          </div>
          <p className="text-xs text-muted-foreground">Por mantenimiento</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mantenimientos.length > 0
              ? (
                  (mantenimientos.filter((m) => m.estado === "Completado").length / mantenimientos.length) *
                  100
                ).toFixed(1)
              : "0"}
            %
          </div>
          <p className="text-xs text-muted-foreground">Tareas completadas a tiempo</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Preventivos</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mantenimientos.filter((m) => m.tipo_mantenimiento.toLowerCase() === "preventivo").length}
          </div>
          <p className="text-xs text-muted-foreground">Realizados</p>
        </CardContent>
      </Card>
    </div>
  )

  const MaintenanceTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Mantenimientos</CardTitle>
        <CardDescription>Historial completo de mantenimientos realizados</CardDescription>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
          <Input
            placeholder="Buscar mantenimiento..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="preventivo">Preventivo</SelectItem>
              <SelectItem value="correctivo">Correctivo</SelectItem>
              <SelectItem value="predictivo">Predictivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-500">Cargando historial...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMantenimientos.length > 0 ? (
                currentMantenimientos.map((m) => (
                  <TableRow key={m.id_mantenimiento}>
                    <TableCell>MT-{m.id_mantenimiento}</TableCell>
                    <TableCell>{m.maquina}</TableCell>
                    <TableCell>{m.tipo_mantenimiento}</TableCell>
                    <TableCell>{m.fecha_programada}</TableCell>
                    <TableCell>{m.duracion}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.estado === "Completado"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {m.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{m.observaciones || "Sin observaciones"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No se encontraron mantenimientos finalizados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        <div className="flex items-center justify-between py-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={handlePreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <p>
            Página {currentPage} de {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={handleNextPage}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen">
      <Toaster />
      <Sidebar />
      <main className="flex-1 bg-gray-100 overflow-y-auto">
        <Header />
        <div className="container mx-auto p-8">
          <SummaryCards />
          <MaintenanceTable />
        </div>
      </main>
    </div>
  )
}