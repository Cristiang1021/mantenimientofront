"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Wrench, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AuthGuard from "@/components/AuthGuard";
import safeLocalStorage from "@/utils/safeLocalStorage";

interface Estadisticas {
  total_mantenimientos: number;
  mantenimientos_pendientes: number;
  total_operarios: number;
  total_maquinas: number;
}

interface Mantenimiento {
  id: number;
  maquina: string;
  tipo: string;
  fecha: string;
  operario: string;
}

interface Operario {
  nombre: string;
  mantenimientos: number;
  eficiencia: number;
}

interface EstadoMantenimiento {
  value: number;
  color: string;
}

export default function AdminDashboard() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total_mantenimientos: 0,
    mantenimientos_pendientes: 0,
    total_operarios: 0,
    total_maquinas: 0,
  });
  const [mantenimientosPorMes, setMantenimientosPorMes] = useState<unknown[]>([]);
  const [estadoMantenimientos, setEstadoMantenimientos] = useState<EstadoMantenimiento[]>([]);
  const [proximosMantenimientos, setProximosMantenimientos] = useState<Mantenimiento[]>([]);
  const [operariosDestacados, setOperariosDestacados] = useState<Operario[]>([]);

  const [paginaProximos, setPaginaProximos] = useState(1);
  const [paginaOperarios, setPaginaOperarios] = useState(1);

  const token = safeLocalStorage.getItem("token");

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Estadísticas Generales
      const estadisticasRes = await fetch(`${process.env.API_BASE_URL}/api/admin/estadisticas`, { headers });
      if (estadisticasRes.ok) setEstadisticas(await estadisticasRes.json());

      // Mantenimientos por Mes
      const mantenimientosPorMesRes = await fetch(`${process.env.API_BASE_URL}/api/admin/mantenimientos-por-mes`, { headers });
      if (mantenimientosPorMesRes.ok) setMantenimientosPorMes(await mantenimientosPorMesRes.json());

      // Estado de Mantenimientos
      const estadoMantenimientosRes = await fetch(`${process.env.API_BASE_URL}/api/admin/estado-mantenimientos`, { headers });
      if (estadoMantenimientosRes.ok) setEstadoMantenimientos(await estadoMantenimientosRes.json());

      // Próximos Mantenimientos
      await fetchProximosMantenimientos();

      // Operarios Destacados
      await fetchOperariosDestacados();
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchProximosMantenimientos = async () => {
    const res = await fetch(`${process.env.API_BASE_URL}/api/admin/proximos-mantenimientos?pagina=${paginaProximos}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProximosMantenimientos(await res.json());
  };

  const fetchOperariosDestacados = async () => {
    const res = await fetch(`${process.env.API_BASE_URL}/api/admin/operarios-destacados?pagina=${paginaOperarios}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setOperariosDestacados(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, [paginaProximos, paginaOperarios, fetchData]);

  const descargarReportes = async (tipoReporte: string) => {
    try {
      const res = await fetch(`${process.env.API_BASE_URL}/api/admin/reporte/mantenimientos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al generar el reporte");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tipoReporte}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el reporte:", error);
    }
  };

  const descargarReportePersonal = async (tipoReporte: string) => {
    try {
      const res = await fetch(`${process.env.API_BASE_URL}/api/admin/reporte/personal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al generar el reporte");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tipoReporte}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el reporte:", error);
    }
  };

  return (
    <AuthGuard allowedRoles={[1]}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard Administrativo</h1>
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <Button onClick={() => descargarReportes("mantenimientos")}>
            <Wrench className="mr-2 h-4 w-4" />
            Descargar Reporte de Mantenimientos
          </Button>
          <Button onClick={() => descargarReportePersonal("personal")}>
            <Users className="mr-2 h-4 w-4" />
            Descargar Reporte de Personal
          </Button>
        </div>
        <br />
        {/* Estadísticas Generales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Mantenimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total_mantenimientos || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.mantenimientos_pendientes || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Operarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total_operarios || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Máquinas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total_maquinas || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mantenimientosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="preventivos" fill="#22c55e" />
                  <Bar dataKey="correctivos" fill="#f97316" />
                  <Bar dataKey="predictivos" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Estado de Mantenimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estadoMantenimientos}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {estadoMantenimientos.map((entry: EstadoMantenimiento, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Mantenimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Mantenimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Operario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proximosMantenimientos.map((mantenimiento) => (
                  <TableRow key={mantenimiento.id}>
                    <TableCell>{mantenimiento.maquina}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{mantenimiento.tipo}</Badge>
                    </TableCell>
                    <TableCell>{mantenimiento.fecha}</TableCell>
                    <TableCell>{mantenimiento.operario}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between mt-4 w-full">
              <Button onClick={() => setPaginaProximos((prev) => Math.max(prev - 1, 1))}>
                Anterior
              </Button>
              <Button onClick={() => setPaginaProximos((prev) => prev + 1)}>Siguiente</Button>
            </div>
          </CardContent>
        </Card>
        <br />
        {/* Operarios Destacados */}
        <Card>
          <CardHeader>
            <CardTitle>Operarios Destacados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Mantenimientos</TableHead>
                  <TableHead>Eficiencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operariosDestacados.map((operario, index) => (
                  <TableRow key={index}>
                    <TableCell>{operario.nombre}</TableCell>
                    <TableCell>{operario.mantenimientos}</TableCell>
                    <TableCell>{operario.eficiencia}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between mt-4 w-full">
              <Button onClick={() => setPaginaOperarios((prev) => Math.max(prev - 1, 1))}>
                Anterior
              </Button>
              <Button onClick={() => setPaginaOperarios((prev) => prev + 1)}>Siguiente</Button>
            </div>
          </CardContent>
        </Card>

        {/* Botones para Descargar Reportes */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <Button onClick={() => descargarReportes("mantenimientos")}>
            <Wrench className="mr-2 h-4 w-4" />
            Descargar Reporte de Mantenimientos
          </Button>
          <Button onClick={() => descargarReportePersonal("personal")}>
            <Users className="mr-2 h-4 w-4" />
            Descargar Reporte de Personal
          </Button>
        </div>
      </div>
    </AuthGuard>
  );
}