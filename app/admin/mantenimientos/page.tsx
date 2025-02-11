"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AuthGuard from "@/components/AuthGuard";
import safeLocalStorage from "@/utils/safeLocalStorage";

type Maintenance = {
  id_mantenimiento: string;
  id_maquinaria: string;
  id_usuario: string;
  tipo_mantenimiento: string;
  fecha_mantenimiento: string;
  frecuencia: string;
  descripcion: string;
  tiempo_requerido: string;
  proxima_fecha: string;
  estado_actual: string;
  herramientas: Array<{ id_herramienta: string; cantidad_usada: string }>;
  nombre_maquinaria?: string;
  nombre_usuario?: string;
};

type Tool = {
  id_herramienta: string;
  nombre?: string;
  cantidad: number;
};

type Machine = {
  id_maquinaria: string;
  nombre: string;
};

type User = {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  rol: string;
};

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentMaintenance, setCurrentMaintenance] = useState<Maintenance>({
    id_mantenimiento: "",
    id_maquinaria: "",
    id_usuario: "",
    tipo_mantenimiento: "",
    fecha_mantenimiento: "",
    frecuencia: "",
    descripcion: "",
    tiempo_requerido: "",
    proxima_fecha: "",
    estado_actual: "",
    herramientas: [],
  });
  const [toolInputs, setToolInputs] = useState<Array<{ id_herramienta: string; cantidad_usada: string }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const fetchData = useCallback(async <T,>(endpoint: string, setter: React.Dispatch<React.SetStateAction<T[]>>, errorMessage: string) => {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/${endpoint}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${safeLocalStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error(errorMessage);
      const data = await response.json();
      setter(data);
    } catch (error) {
      toast({
        title: "Error",
        description: `${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    fetchData<Maintenance>("mantenimientos", setMaintenances, "Error al cargar mantenimientos");
    fetchData<Tool>("herramientas", setTools, "Error al cargar herramientas");
    fetchData<Machine>("maquinarias", setMachines, "Error al cargar maquinarias");
    fetchData<User>("usuarios", setUsers, "Error al cargar usuarios");
  }, [fetchData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const filteredMaintenances = maintenances.filter((maintenance) =>
    maintenance.nombre_maquinaria?.toLowerCase().includes(searchTerm) ||
    maintenance.tipo_mantenimiento?.toLowerCase().includes(searchTerm) ||
    maintenance.herramientas?.some((tool) =>
      tools.find(t => t.id_herramienta === tool.id_herramienta)?.nombre?.toLowerCase().includes(searchTerm)
    ) ||
    maintenance.nombre_usuario?.toLowerCase().includes(searchTerm)
  );

  const paginatedMaintenances = filteredMaintenances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else if (direction === "next" && currentPage < Math.ceil(filteredMaintenances.length / itemsPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleAddToolInput = () => {
    if (toolInputs.length < tools.length) {
      setToolInputs([...toolInputs, { id_herramienta: "", cantidad_usada: "" }]);
    } else {
      toast({
        title: "Error",
        description: "Ya has añadido todas las herramientas disponibles.",
        variant: "destructive",
      });
    }
  };

  const handleToolChange = (index: number, field: 'id_herramienta' | 'cantidad_usada', value: string) => {
    setToolInputs((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const isToolAlreadySelected = (id_herramienta: string) => {
    return toolInputs.some(tool => tool.id_herramienta === id_herramienta);
  };

  const getAvailableQuantity = (id_herramienta: string) => {
    const tool = tools.find(t => t.id_herramienta === id_herramienta);
    return tool ? tool.cantidad : 0;
  };

  const handleFieldChange = (field: keyof Maintenance, value: string) => {
    setCurrentMaintenance((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveMaintenance = async () => {
    try {
      const url = editMode
        ? `${process.env.API_BASE_URL}/mantenimientos/${currentMaintenance.id_mantenimiento}`
        : `${process.env.API_BASE_URL}/mantenimientos`;
      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...currentMaintenance,
          herramientas: toolInputs,
        }),
      });
      if (!response.ok) throw new Error("Error al guardar mantenimiento");

      toast({
        title: "Éxito",
        description: editMode
          ? "Mantenimiento actualizado exitosamente"
          : "Mantenimiento creado exitosamente",
      });
      resetCurrentMaintenance();
      fetchData<Maintenance>("mantenimientos", setMaintenances, "Error al cargar mantenimientos");
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al guardar mantenimiento: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const resetCurrentMaintenance = () => {
    setCurrentMaintenance({
      id_mantenimiento: "",
      id_maquinaria: "",
      id_usuario: "",
      tipo_mantenimiento: "",
      fecha_mantenimiento: "",
      frecuencia: "",
      descripcion: "",
      tiempo_requerido: "",
      proxima_fecha: "",
      estado_actual: "",
      herramientas: [],
    });
    setToolInputs([]);
    setOpenDialog(false);
  };

  const confirmDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este mantenimiento?")) {
      handleDeleteMaintenance(id);
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/mantenimientos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message && errorData.message.includes("foreign key constraint fails")) {
          throw new Error("No se puede eliminar este mantenimiento porque ya ha comenzado o tiene datos asociados en otras tablas.");
        } else {
          throw new Error("Error al eliminar mantenimiento");
        }
      }

      toast({
        title: "Éxito",
        description: "Mantenimiento eliminado exitosamente",
      });
      fetchData<Maintenance>("mantenimientos", setMaintenances, "Error al cargar mantenimientos");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error desconocido al eliminar el mantenimiento',
        variant: "destructive",
      });
    }
  };

  const handleEditMaintenance = (maintenance: Maintenance) => {
    setEditMode(true);
    setCurrentMaintenance(maintenance);
    setToolInputs(maintenance.herramientas || []);
    setOpenDialog(true);
  };

  return (
    <AuthGuard allowedRoles={[1]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gestión de Mantenimientos</h1>
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Buscar por maquinaria o herramienta..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button
            onClick={() => {
              resetCurrentMaintenance();
              setOpenDialog(true);
            }}
          >
            Nuevo Mantenimiento
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Maquinaria</TableCell>
              <TableCell>Operario</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Fecha Mantenimiento</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMaintenances.map((maintenance) => (
              <TableRow key={maintenance.id_mantenimiento}>
                <TableCell>{maintenance.nombre_maquinaria}</TableCell>
                <TableCell>{maintenance.nombre_usuario}</TableCell>
                <TableCell>{maintenance.tipo_mantenimiento}</TableCell>
                <TableCell>{maintenance.fecha_mantenimiento}</TableCell>
                <TableCell>
                  <Badge>{maintenance.estado_actual}</Badge>
                </TableCell>
                <TableCell>
                  {["cancelado", "completado"].includes(maintenance.estado_actual.toLowerCase()) ? (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `${process.env.API_BASE_URL}/api/reporte/mantenimiento/${maintenance.id_mantenimiento}`,
                            {
                              method: "GET",
                              headers: {
                                Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
                              },
                            }
                          );

                          if (!response.ok) throw new Error("Error al descargar el reporte. Inténtalo nuevamente.");

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `Reporte_Mantenimiento_MT${maintenance.id_mantenimiento}.pdf`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: error instanceof Error ? error.message : 'Unknown error',
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Descargar Reporte
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => handleEditMaintenance(maintenance)}>
                        Editar
                      </Button>
                      <Button variant="destructive" onClick={() => confirmDelete(maintenance.id_mantenimiento)}>
                        Eliminar
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between mt-4">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => handlePageChange("prev")}>
            Anterior
          </Button>
          <p>Página {currentPage} de {Math.ceil(filteredMaintenances.length / itemsPerPage)}</p>
          <Button
            variant="outline"
            disabled={currentPage === Math.ceil(filteredMaintenances.length / itemsPerPage)}
            onClick={() => handlePageChange("next")}
          >
            Siguiente
          </Button>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-[900px]">
            <DialogHeader>
              <DialogTitle>{editMode ? "Editar Mantenimiento" : "Crear Mantenimiento"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Maquinaria</Label>
                <Select
                  value={currentMaintenance.id_maquinaria}
                  onValueChange={(value) => handleFieldChange("id_maquinaria", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione maquinaria" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((machine) => (
                      <SelectItem key={machine.id_maquinaria} value={machine.id_maquinaria}>
                        {machine.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Operario</Label>
                <Select
                  value={currentMaintenance.id_usuario}
                  onValueChange={(value) => handleFieldChange("id_usuario", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione operario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => user.rol.toLowerCase() !== 'administrador')
                      .map((user) => (
                        <SelectItem key={user.id_usuario} value={user.id_usuario}>
                          {`${user.nombres} ${user.apellidos} (${user.rol})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de Mantenimiento</Label>
                <Input
                  placeholder="Preventivo, Correctivo..."
                  value={currentMaintenance.tipo_mantenimiento}
                  onChange={(e) => handleFieldChange("tipo_mantenimiento", e.target.value)}
                />
              </div>
              <div>
                <Label>Frecuencia (días)</Label>
                <Input
                  type="number"
                  placeholder="Frecuencia en días"
                  value={currentMaintenance.frecuencia}
                  onChange={(e) => handleFieldChange("frecuencia", e.target.value)}
                />
              </div>
              <div>
                <Label>Fecha del Mantenimiento</Label>
                <Input
                  type="date"
                  value={currentMaintenance.fecha_mantenimiento}
                  onChange={(e) => handleFieldChange("fecha_mantenimiento", e.target.value)}
                />
              </div>
              <div>
                <Label>Fecha Siguiente (calculada)</Label>
                <Input
                  type="date"
                  disabled
                  value={currentMaintenance.proxima_fecha || ""}
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Descripción del mantenimiento"
                  value={currentMaintenance.descripcion}
                  onChange={(e) => handleFieldChange("descripcion", e.target.value)}
                />
              </div>
              <div>
                <Label>Tiempo Requerido (horas)</Label>
                <Input
                  type="number"
                  placeholder="Horas necesarias"
                  value={currentMaintenance.tiempo_requerido}
                  onChange={(e) => handleFieldChange("tiempo_requerido", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Herramientas</Label>
              {toolInputs.map((input, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Select
                    value={input.id_herramienta}
                    onValueChange={(value) => handleToolChange(index, 'id_herramienta', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione herramienta" />
                    </SelectTrigger>
                    <SelectContent>
                      {tools.map((tool) => (
                        <SelectItem 
                          key={tool.id_herramienta} 
                          value={tool.id_herramienta}
                          disabled={isToolAlreadySelected(tool.id_herramienta) && tool.id_herramienta !== input.id_herramienta}
                        >
                          {`${tool.nombre} (${tool.cantidad})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Cantidad usada"
                    value={input.cantidad_usada}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const availableQuantity = getAvailableQuantity(input.id_herramienta);
                      if (parseInt(newValue) > availableQuantity) {
                        toast({
                          title: "Error",
                          description: `La cantidad máxima disponible es ${availableQuantity}`,
                          variant: "destructive",
                        });
                      } else {
                        handleToolChange(index, 'cantidad_usada', newValue);
                      }
                    }}
                    min="1"
                    max={getAvailableQuantity(input.id_herramienta).toString()}
                  />
                  <Button 
                    variant="destructive" 
                    onClick={() => setToolInputs(prev => prev.filter((_, i) => i !== index))}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
              <Button onClick={handleAddToolInput}>Añadir Herramienta</Button>
            </div>
            <Button className="mt-4 w-full" onClick={handleSaveMaintenance}>
              {editMode ? "Guardar Cambios" : "Crear Mantenimiento"}
            </Button>
          </DialogContent>
        </Dialog>
        <Toaster />
      </div>
    </AuthGuard>
  );
}