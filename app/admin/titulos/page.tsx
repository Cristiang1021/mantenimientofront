"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import safeLocalStorage from "@/utils/safeLocalStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2, Plus, Search, Loader2 } from 'lucide-react'

type Titulo = {
  id_titulo: string
  nombre: string
}

export default function TitulosManagement() {
  const [titulos, setTitulos] = useState<Titulo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTitulo, setSelectedTitulo] = useState<Titulo | null>(null)
  const [newTitulo, setNewTitulo] = useState({ nombre: "" })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTitulos()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTitulos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/titulos`, {
        headers: {
          Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Error al obtener los títulos.")
      const data = await response.json()
      setTitulos(data)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido al cargar títulos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTitulo = async () => {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/titulo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
        },
        body: JSON.stringify(newTitulo),
      })

      if (!response.ok) throw new Error("Error al guardar el título.")
      toast({
        title: "Éxito",
        description: "Título creado con éxito.",
      })
      setModalOpen(false)
      setNewTitulo({ nombre: "" })
      fetchTitulos()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido al guardar el título",
        variant: "destructive",
      })
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedTitulo) return
    try {
      const response = await fetch(
        `${process.env.API_BASE_URL}/titulo/${selectedTitulo.id_titulo}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
          },
          body: JSON.stringify({ nombre: selectedTitulo.nombre }),
        }
      )

      if (!response.ok) throw new Error("Error al editar el título.")
      toast({
        title: "Éxito",
        description: "Título editado con éxito.",
      })
      setEditModalOpen(false)
      fetchTitulos()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido al editar el título",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTitulo = async () => {
    if (!selectedTitulo) return
    try {
      const response = await fetch(
        `${process.env.API_BASE_URL}/titulo/${selectedTitulo.id_titulo}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.mensaje || "Error al eliminar el título.")
      }
      toast({
        title: "Éxito",
        description: "Título eliminado con éxito.",
      })
      setDeleteModalOpen(false)
      fetchTitulos()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido al eliminar el título",
        variant: "destructive",
      })
    }
  }

  const filteredTitulos = titulos.filter((titulo) =>
    titulo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Títulos</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Título
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTitulos.map((titulo) => (
              <TableRow key={titulo.id_titulo}>
                <TableCell>{titulo.nombre}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTitulo(titulo)
                      setEditModalOpen(true)
                    }}
                    className="mr-2"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedTitulo(titulo)
                      setDeleteModalOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TituloFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTitulo}
        titulo={newTitulo}
        setTitulo={setNewTitulo as React.Dispatch<React.SetStateAction<Partial<Titulo> | null>>}
        title="Añadir Título"
        buttonText="Guardar Título"
      />

      <TituloFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
        titulo={selectedTitulo}
        setTitulo={setSelectedTitulo as React.Dispatch<React.SetStateAction<Partial<Titulo> | null>>}
        title="Editar Título"
        buttonText="Guardar Cambios"
      />

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ¿Estás seguro de que deseas eliminar este título?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTitulo}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  )
}

type TituloFormModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  titulo: Partial<Titulo> | null
  setTitulo: React.Dispatch<React.SetStateAction<Partial<Titulo> | null>>
  title: string
  buttonText: string
}

function TituloFormModal({
  isOpen,
  onClose,
  onSave,
  titulo,
  setTitulo,
  title,
  buttonText,
}: TituloFormModalProps) {
  if (!titulo) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre" className="text-right">
              Nombre
            </Label>
            <Input
              id="nombre"
              value={titulo.nombre}
              onChange={(e) =>
                setTitulo({ ...titulo, nombre: e.target.value })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>{buttonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}