"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/AuthGuard"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Pencil, Trash2, Search } from 'lucide-react'
import safeLocalStorage from "@/utils/safeLocalStorage";

type Usuario = {
  id_usuario: string
  nombres: string
  apellidos: string
  cedula: string
  telefono: string
  rol: string
  estado_usuario: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchUsuarios()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUsuarios = async () => {
    const user = JSON.parse(safeLocalStorage.getItem("user") || "{}")

    if (!user || !user.token) {
      toast({
        title: "Error",
        description: "No se encontró el token. Inicia sesión nuevamente.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`${process.env.API_BASE_URL}/usuarios`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "No autorizado",
            description: "Inicia sesión nuevamente.",
            variant: "destructive",
          })
          router.push("/login")
        } else {
          throw new Error("Error al obtener los usuarios.")
        }
        return
      }

      const data = await response.json()
      setUsuarios(data)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido al obtener los usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    const user = JSON.parse(safeLocalStorage.getItem("user") || "{}")

    if (!user || !user.token) {
      toast({
        title: "Error",
        description: "No se encontró el token. Inicia sesión nuevamente.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      const response = await fetch(
        `${process.env.API_BASE_URL}/usuarios/${selectedUser.id_usuario}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )

      if (response.ok) {
        setUsuarios((prev) =>
          prev.filter((u) => u.id_usuario !== selectedUser.id_usuario)
        )
        setDeleteModalOpen(false)
        toast({
          title: "Éxito",
          description: "Usuario eliminado con éxito.",
        })
      } else {
        const data = await response.json()
        throw new Error(data.mensaje || "Error al eliminar el usuario.")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido al eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cedula.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AuthGuard allowedRoles={[1]}>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Input
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Cargando usuarios...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Nombres</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell className="text-right">Acciones</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usuario) => (
                <TableRow key={usuario.id_usuario}>
                  <TableCell>{usuario.nombres} {usuario.apellidos}</TableCell>
                  <TableCell>{usuario.cedula}</TableCell>
                  <TableCell>{usuario.telefono}</TableCell>
                  <TableCell>{usuario.rol}</TableCell>
                  <TableCell>{usuario.estado_usuario}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/usuarios/${usuario.cedula}/editar`)}
                      className="mr-2"
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(usuario)
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

        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                ¿Estás seguro de que deseas eliminar al usuario{" "}
                {selectedUser?.nombres} {selectedUser?.apellidos}?
              </DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </AuthGuard>
  )
}