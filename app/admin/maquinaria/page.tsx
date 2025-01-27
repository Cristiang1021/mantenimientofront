"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import safeLocalStorage from "@/utils/safeLocalStorage";

type Maquinaria = {
  id_maquinaria: string
  nombre: string
  numero_serie: string
  modelo: string
  descripcion: string
  m_imagen: string | null
}

type NewMaquinaria = Omit<Maquinaria, 'id_maquinaria'> & {
  m_imagen: string | null
}

export default function MaquinariaManagement() {
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedMaquinaria, setSelectedMaquinaria] = useState<Maquinaria | null>(null)
  const [newMaquinaria, setNewMaquinaria] = useState<NewMaquinaria>({
    nombre: "",
    numero_serie: "",
    modelo: "",
    descripcion: "",
    m_imagen: null,
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMaquinarias()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMaquinarias = async () => {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/maquinarias`, {
        headers: {
          Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error("Error al obtener las maquinarias.")
      const data = await response.json()
      setMaquinarias(data)
    } catch (err) {
      toast({
        title: "Error",
        description: `Error al cargar maquinarias: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result as string)
        if (isEdit && selectedMaquinaria) {
          setSelectedMaquinaria({ ...selectedMaquinaria, m_imagen: reader.result as string })
        } else {
          setNewMaquinaria({ ...newMaquinaria, m_imagen: reader.result as string })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveMaquinaria = async () => {
    try {
      const formData = new FormData()
      Object.entries(newMaquinaria).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      const response = await fetch(`${process.env.API_BASE_URL}/maquinaria`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error("Error al guardar la maquinaria.")

      toast({
        title: "Éxito",
        description: "Maquinaria creada con éxito.",
      })
      setModalOpen(false)
      resetNewMaquinaria()
      fetchMaquinarias()
    } catch (err) {
      toast({
        title: "Error",
        description: `Error al guardar la maquinaria: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedMaquinaria) return

    try {
      const formData = new FormData()
      Object.entries(selectedMaquinaria).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      const response = await fetch(
        `${process.env.API_BASE_URL}/maquinaria/${selectedMaquinaria.id_maquinaria}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
          },
          body: formData,
        }
      )

      if (!response.ok) throw new Error("Error al editar la maquinaria.")

      toast({
        title: "Éxito",
        description: "Maquinaria editada con éxito.",
      })
      setEditModalOpen(false)
      fetchMaquinarias()
    } catch (err) {
      toast({
        title: "Error",
        description: `Error al editar la maquinaria: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteMaquinaria = async () => {
    if (!selectedMaquinaria) return

    try {
      const response = await fetch(
        `${process.env.API_BASE_URL}/maquinaria/${selectedMaquinaria.id_maquinaria}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
          },
        }
      )

      if (!response.ok) throw new Error("Error al eliminar la maquinaria.")

      toast({
        title: "Éxito",
        description: "Maquinaria eliminada con éxito.",
      })
      setDeleteModalOpen(false)
      fetchMaquinarias()
    } catch (err) {
      toast({
        title: "Error",
        description: `Error al eliminar la maquinaria: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const resetNewMaquinaria = () => {
    setNewMaquinaria({
      nombre: "",
      numero_serie: "",
      modelo: "",
      descripcion: "",
      m_imagen: null,
    })
    setPreviewImage(null)
  }

  const filteredMaquinarias = maquinarias.filter(
    (maquina) =>
      maquina.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maquina.numero_serie.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Maquinarias</h1>
      <div className="flex justify-between items-center mb-6">
        <Input
          placeholder="Buscar por nombre o número de serie"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setModalOpen(true)}>
          Añadir Maquinaria
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Número de Serie</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMaquinarias.map((maquina) => (
            <TableRow key={maquina.id_maquinaria}>
              <TableCell className="font-medium">{maquina.nombre}</TableCell>
              <TableCell>{maquina.numero_serie}</TableCell>
              <TableCell>{maquina.modelo}</TableCell>
              <TableCell>{maquina.descripcion}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMaquinaria(maquina)
                      setPreviewImage(
                        maquina.m_imagen
                          ? `data:image/jpeg;base64,${maquina.m_imagen}`
                          : null
                      )
                      setEditModalOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedMaquinaria(maquina)
                      setDeleteModalOpen(true)
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <MaquinariaFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMaquinaria}
        maquinaria={newMaquinaria}
        setMaquinaria={setNewMaquinaria as React.Dispatch<React.SetStateAction<Partial<Maquinaria> | NewMaquinaria>>}
        previewImage={previewImage}
        handleFileChange={handleFileChange}
        title="Añadir Maquinaria"
        buttonText="Guardar Maquinaria"
      />

      <MaquinariaFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
        maquinaria={selectedMaquinaria}
        setMaquinaria={setSelectedMaquinaria as React.Dispatch<React.SetStateAction<Partial<Maquinaria> | NewMaquinaria>>}
        previewImage={previewImage}
        handleFileChange={(e) => handleFileChange(e, true)}
        title="Editar Maquinaria"
        buttonText="Guardar Cambios"
      />

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro de que deseas eliminar esta maquinaria?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteMaquinaria}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

type MaquinariaFormModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  maquinaria: Partial<Maquinaria> | NewMaquinaria | null
  setMaquinaria: React.Dispatch<React.SetStateAction<Partial<Maquinaria> | NewMaquinaria>>
  previewImage: string | null
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  title: string
  buttonText: string
}

function MaquinariaFormModal({
  isOpen,
  onClose,
  onSave,
  maquinaria,
  setMaquinaria,
  previewImage,
  handleFileChange,
  title,
  buttonText,
}: MaquinariaFormModalProps) {
  if (!maquinaria) return null

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
              value={maquinaria.nombre}
              onChange={(e) =>
                setMaquinaria({ ...maquinaria, nombre: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="numero_serie" className="text-right">
              Número de Serie
            </Label>
            <Input
              id="numero_serie"
              value={maquinaria.numero_serie}
              onChange={(e) =>
                setMaquinaria({ ...maquinaria, numero_serie: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="modelo" className="text-right">
              Modelo
            </Label>
            <Input
              id="modelo"
              value={maquinaria.modelo}
              onChange={(e) =>
                setMaquinaria({ ...maquinaria, modelo: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descripcion" className="text-right">
              Descripción
            </Label>
            <Input
              id="descripcion"
              value={maquinaria.descripcion}
              onChange={(e) =>
                setMaquinaria({ ...maquinaria, descripcion: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imagen" className="text-right">
              Imagen
            </Label>
            <Input
              id="imagen"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
          {previewImage && (
            <div className="mt-4 flex justify-center">
              <Avatar className="w-32 h-32">
                <AvatarImage src={previewImage} alt="Preview" />
                <AvatarFallback>Imagen</AvatarFallback>
              </Avatar>
            </div>
          )}
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