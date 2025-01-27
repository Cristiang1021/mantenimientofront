"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import safeLocalStorage from "@/utils/safeLocalStorage";

interface Tool {
  id_herramienta: number;
  nombre: string;
  tipo: string;
  descripcion: string;
  cantidad: number;
  h_imagen: string | null; // Base64 string or null
}

export default function ToolsManagement() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [newTool, setNewTool] = useState<Omit<Tool, "id_herramienta">>({
    nombre: "",
    tipo: "",
    descripcion: "",
    cantidad: 0,
    h_imagen: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/herramientas`, {
        headers: {
          Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener herramientas.");
      const data: Tool[] = await response.json();
      setTools(data);
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al cargar herramientas: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        if (isEdit && selectedTool) {
          setSelectedTool({ ...selectedTool, h_imagen: base64String });
        } else {
          setNewTool({ ...newTool, h_imagen: base64String });
        }
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTool = async () => {
    try {
      const formData = new FormData();
      Object.entries(newTool).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const response = await fetch(`${process.env.API_BASE_URL}/herramientas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al guardar la herramienta.");

      toast({ title: "Éxito", description: "Herramienta creada con éxito." });
      setModalOpen(false);
      fetchTools();
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al guardar herramienta: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTool) return;

    try {
      const formData = new FormData();
      Object.entries(selectedTool).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const response = await fetch(
        `${process.env.API_BASE_URL}/herramientas/${selectedTool.id_herramienta}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error al editar la herramienta.");

      toast({ title: "Éxito", description: "Herramienta editada con éxito." });
      setEditModalOpen(false);
      fetchTools();
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al editar herramienta: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTool = async () => {
    if (!selectedTool) return;

    try {
      const response = await fetch(
        `${process.env.API_BASE_URL}/herramientas/${selectedTool.id_herramienta}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al eliminar herramienta.");

      toast({ title: "Éxito", description: "Herramienta eliminada con éxito." });
      setDeleteModalOpen(false);
      fetchTools();
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al eliminar herramienta: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const filteredTools = tools.filter((tool) =>
    [tool.nombre, tool.tipo].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Gestión de Herramientas</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar por nombre o tipo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setModalOpen(true)}>Añadir Herramienta</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTools.map((tool) => (
            <TableRow key={tool.id_herramienta}>
              <TableCell>{tool.nombre}</TableCell>
              <TableCell>{tool.tipo}</TableCell>
              <TableCell>{tool.descripcion}</TableCell>
              <TableCell>{tool.cantidad}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTool(tool);
                    setPreviewImage(tool.h_imagen || null);
                    setEditModalOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    setSelectedTool(tool);
                    setDeleteModalOpen(true);
                  }}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal Añadir */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Herramienta</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Nombre</Label>
            <Input
              value={newTool.nombre}
              onChange={(e) => setNewTool({ ...newTool, nombre: e.target.value })}
            />
            <Label>Tipo</Label>
            <Input
              value={newTool.tipo}
              onChange={(e) => setNewTool({ ...newTool, tipo: e.target.value })}
            />
            <Label>Descripción</Label>
            <Input
              value={newTool.descripcion}
              onChange={(e) => setNewTool({ ...newTool, descripcion: e.target.value })}
            />
            <Label>Cantidad</Label>
            <Input
              type="number"
              value={newTool.cantidad}
              onChange={(e) =>
                setNewTool({ ...newTool, cantidad: parseInt(e.target.value, 10) })
              }
            />
            <Label>Imagen</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {previewImage && (
              <Avatar className="mt-4 w-32 h-32">
                <AvatarImage src={previewImage} />
                <AvatarFallback>Imagen</AvatarFallback>
              </Avatar>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTool}>Guardar Herramienta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Herramienta</DialogTitle>
          </DialogHeader>
          {selectedTool && (
            <div>
              <Label>Nombre</Label>
              <Input
                value={selectedTool.nombre}
                onChange={(e) =>
                  setSelectedTool({ ...selectedTool, nombre: e.target.value })
                }
              />
              <Label>Tipo</Label>
              <Input
                value={selectedTool.tipo}
                onChange={(e) =>
                  setSelectedTool({ ...selectedTool, tipo: e.target.value })
                }
              />
              <Label>Descripción</Label>
              <Input
                value={selectedTool.descripcion}
                onChange={(e) =>
                  setSelectedTool({ ...selectedTool, descripcion: e.target.value })
                }
              />
              <Label>Cantidad</Label>
              <Input
                type="number"
                value={selectedTool.cantidad}
                onChange={(e) =>
                  setSelectedTool({
                    ...selectedTool,
                    cantidad: parseInt(e.target.value, 10),
                  })
                }
              />
              <Label>Imagen</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, true)}
              />
              {previewImage && (
                <Avatar className="mt-4 w-32 h-32">
                  <AvatarImage src={previewImage} />
                  <AvatarFallback>Imagen</AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ¿Estás seguro de que deseas eliminar esta herramienta?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTool}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
