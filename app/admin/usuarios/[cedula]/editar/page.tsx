"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import AuthGuard from "@/components/AuthGuard"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import safeLocalStorage from "@/utils/safeLocalStorage";
type User = {
  id_usuario: string
  nombres: string
  apellidos: string
  email: string
  telefono: string
  genero: string
  estado_usuario: string
  rol: string
  id_titulo: string
  fecha_registro: string
  foto_perfil: string | null
  foto_preview?: string
}

type Title = {
  id_titulo: string
  nombre: string
}

type Role = {
  id_rol: string
  nombre: string
}

type Contact = {
  nombre: string
  direccion: string
  celular: string
  convencional: string
  email: string
  parentesco: string
}

export default function EditUser() {
  const [user, setUser] = useState<User | null>(null)
  const [titles, setTitles] = useState<Title[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [contactModal, setContactModal] = useState(false)
  const [contact, setContact] = useState<Contact>({
    nombre: "",
    direccion: "",
    celular: "",
    convencional: "",
    email: "",
    parentesco: "",
  })
  const router = useRouter()
  const params = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, titlesData, rolesData] = await Promise.all([
          fetch(`${process.env.API_BASE_URL}/usuarios/cedula/${params.cedula}`, {
            headers: { Authorization: `Bearer ${safeLocalStorage.getItem("token")}` },
          }).then(res => res.json()),
          fetch(`${process.env.API_BASE_URL}/titulos`, {
            headers: { Authorization: `Bearer ${safeLocalStorage.getItem("token")}` },
          }).then(res => res.json()),
          fetch(`${process.env.API_BASE_URL}/roles`, {
            headers: { Authorization: `Bearer ${safeLocalStorage.getItem("token")}` },
          }).then(res => res.json()),
        ])

        setUser({
          ...userData,
          foto_perfil: userData.foto_perfil ? `data:image/jpeg;base64,${userData.foto_perfil}` : null,
        })
        setTitles(titlesData)
        setRoles(rolesData)
      } catch (err) {
        toast({
          title: "Error",
          description: `Error al cargar datos: ${err instanceof Error ? err.message : 'Unknown error'}`,
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [params.cedula, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUser(prev => {
          if (prev) {
            return {
              ...prev,
              foto_perfil: reader.result as string,
              foto_preview: reader.result as string,
            }
          }
          return null
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      const formData = new FormData()
      Object.entries(user).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString())
        }
      })

      const response = await fetch(`${process.env.API_BASE_URL}/usuarios/cedula/${params.cedula}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${safeLocalStorage.getItem("token")}` },
        body: formData,
      })

      if (!response.ok) throw new Error("Error al guardar los cambios.")

      toast({
        title: "Éxito",
        description: "Usuario actualizado con éxito.",
      })

      router.push("/admin/usuarios")
    } catch (err) {
      toast({
        title: "Error",
        description: `Error al guardar los cambios: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleAddContact = async () => {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/usuarios/${params.cedula}/contacto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${safeLocalStorage.getItem("token")}`,
        },
        body: JSON.stringify(contact),
      })

      if (!response.ok) throw new Error("Error al añadir contacto.")

      toast({
        title: "Éxito",
        description: "Contacto añadido con éxito.",
      })

      setContactModal(false)
    } catch (err) {
      toast({
        title: "Error",
        description: `Error al añadir contacto: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  return (
    <AuthGuard allowedRoles={[1]}>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Editar Usuario</h1>
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-32 h-32">
            <AvatarImage src={user.foto_preview || user.foto_perfil || undefined} />
            <AvatarFallback>Foto</AvatarFallback>
          </Avatar>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Cambiar Foto
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Dialog open={contactModal} onOpenChange={setContactModal}>
            <DialogTrigger asChild>
              <Button variant="outline">Añadir Contacto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Contacto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                {Object.entries(contact).map(([key, value]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                    <Input
                      id={key}
                      value={value}
                      onChange={(e) => setContact({ ...contact, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setContactModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddContact}>Guardar Contacto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <form className="grid grid-cols-2 gap-4">
          {[
            { label: "Nombres", key: "nombres" },
            { label: "Apellidos", key: "apellidos" },
            { label: "Email", key: "email" },
            { label: "Teléfono", key: "telefono" },
          ].map(({ label, key }) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={user[key as keyof User] || ""}
                onChange={(e) => setUser({ ...user, [key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <Label htmlFor="genero">Género</Label>
            <Select
              value={user.genero}
              onValueChange={(value) => setUser({ ...user, genero: value })}
            >
              <SelectTrigger id="genero">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={user.estado_usuario}
              onValueChange={(value) => setUser({ ...user, estado_usuario: value })}
            >
              <SelectTrigger id="estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="rol">Rol</Label>
            <Select
              value={user.rol}
              onValueChange={(value) => setUser({ ...user, rol: value })}
            >
              <SelectTrigger id="rol">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id_rol} value={role.nombre}>
                    {role.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Select
              value={user.id_titulo}
              onValueChange={(value) => setUser({ ...user, id_titulo: value })}
            >
              <SelectTrigger id="titulo">
                <SelectValue>
                  {titles.find((title) => title.id_titulo === user.id_titulo)?.nombre || "Selecciona un título"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {titles.map((title) => (
                  <SelectItem key={title.id_titulo} value={title.id_titulo}>
                    {title.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fecha_registro">Fecha de Registro</Label>
            <Input id="fecha_registro" value={user.fecha_registro} disabled />
          </div>
        </form>
        <div className="flex justify-end mt-6 space-x-4">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </div>
      <Toaster />
    </AuthGuard>
  )
}