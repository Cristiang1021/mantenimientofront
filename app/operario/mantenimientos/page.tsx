"use client"

import React, { useEffect, useState } from "react"
import { Wrench, Calendar, User, Bell, LayoutDashboard, LogOut } from 'lucide-react'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import Image from "next/image"
import safeLocalStorage from "@/utils/safeLocalStorage";
type Mantenimiento = {
  id_mantenimiento: string
  maquina: string
  estado: string
  fecha_programada: string
}

type Perfil = {
  nombre: string
  foto: string | null
  email: string | null
}

export default function OperarioMantenimiento() {
  const router = useRouter()
  const { toast } = useToast()
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])
  const [perfil, setPerfil] = useState<Perfil>({
    nombre: "Operario",
    foto: null,
    email: null,
  })
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 4

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

        const [mantenimientosResponse, perfilResponse] = await Promise.all([
          fetch(`${process.env.API_BASE_URL}/mantenimientos/usuario`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.API_BASE_URL}/api/operario/perfil`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (!mantenimientosResponse.ok || !perfilResponse.ok) {
          throw new Error("Error al obtener los datos")
        }

        const mantenimientosData = await mantenimientosResponse.json()
        const perfilData = await perfilResponse.json()

        const sortedMantenimientos = mantenimientosData.mantenimientos.sort((a: Mantenimiento, b: Mantenimiento) => {
          if (a.estado === "pendiente" && b.estado !== "pendiente") return -1
          if (a.estado !== "pendiente" && b.estado === "pendiente") return 1
          return 0
        })

        setMantenimientos(sortedMantenimientos)
        setPerfil({
          nombre: perfilData.nombre,
          foto: perfilData.foto,
          email: perfilData.email,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [router, toast])

  const filteredMantenimientos = mantenimientos.filter(
    (m) =>
      m.maquina.toLowerCase().includes(search.toLowerCase()) ||
      m.estado.toLowerCase().includes(search.toLowerCase())
  )

  const displayedMantenimientos = filteredMantenimientos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredMantenimientos.length / itemsPerPage)

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "numeric",
      year: "numeric",
    })
  }

  const pieChartData = [
    { name: "Pendiente", value: mantenimientos.filter((m) => m.estado === "pendiente").length, color: "#facc15" },
    { name: "En progreso", value: mantenimientos.filter((m) => m.estado === "En progreso").length, color: "#22c55e" },
    { name: "Completados", value: mantenimientos.filter((m) => m.estado === "Completado").length, color: "#3b82f6" },
    { name: "Cancelados", value: mantenimientos.filter((m) => m.estado === "Cancelado").length, color: "#ef4444" },
  ]

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
        <h1 className="text-2xl font-bold">Vista general de mantenimientos</h1>
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

  const StatCards = () => (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Total Mantenimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mantenimientos.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mantenimientos.filter((m) => m.estado === "pendiente").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>En Progreso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mantenimientos.filter((m) => m.estado === "En progreso").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Completados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mantenimientos.filter((m) => m.estado === "Completado").length}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const MaintenanceTable = () => (
    <Card>
      <CardHeader>
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Máquina</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedMantenimientos.map((mantenimiento) => (
              <TableRow key={mantenimiento.id_mantenimiento}>
                <TableCell>{mantenimiento.maquina}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      mantenimiento.estado === "pendiente" ? "default" : "secondary"
                    }
                  >
                    {mantenimiento.estado}
                  </Badge>
                </TableCell>
                <TableCell>{formatFecha(mantenimiento.fecha_programada)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/operario/mantenimiento/${mantenimiento.id_mantenimiento}`)
                    }
                  >
                    {mantenimiento.estado === "pendiente"
                      ? "Empezar"
                      : "Ver detalles"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Anterior
          </Button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Siguiente
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const MaintenanceDistributionChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Mantenimientos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              pendiente: {
                label: "Pendiente",
                color: "hsl(var(--chart-1))",
              },
              enProgreso: {
                label: "En progreso",
                color: "hsl(var(--chart-2))",
              },
              completados: {
                label: "Completados",
                color: "hsl(var(--chart-3))",
              },
              cancelados: {
                label: "Cancelados",
                color: "hsl(var(--chart-4))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100">
        <Header />
        <div className="container mx-auto p-8">
          <StatCards />
          <div className="grid grid-cols-2 gap-4">
            <MaintenanceTable />
            <MaintenanceDistributionChart />
          </div>
        </div>
      </main>
    </div>
  )
}