"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Wrench, PenToolIcon as Tool, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import safeLocalStorage from "@/utils/safeLocalStorage";

export default function Login() {
  const [formData, setFormData] = useState({
    email_or_cedula: "",
    password: "",
  })
  const [loginError, setLoginError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setLoginError("")

    try {
      const response = await fetch(`${process.env.API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        safeLocalStorage.setItem("token", data.access_token)
        safeLocalStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id_usuario,
            role: data.rol,
            token: data.access_token,
          })
        )

        if (data.rol === 1) {
          router.push("/admin/dashboard")
        } else if (data.rol === 2) {
          router.push("/operario/dashboard")
        } else {
          setLoginError("Rol desconocido. Contacte al administrador.")
        }
      } else {
        setLoginError(data.mensaje || "Credenciales incorrectas.")
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setLoginError("Error de red. Por favor, inténtelo nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterRedirect = () => {
    router.push("/registro")
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gradient-to-br from-background to-secondary/20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rotate-12 transform scale-150" />
      </div>

      <div className="container px-4 md:px-6 flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 w-full max-w-6xl items-center">
          {/* Branding section */}
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left lg:pr-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Sistema de Gestión de Mantenimiento Industrial
              </h1>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Gestiona el mantenimiento de tu maquinaria industrial de manera eficiente y segura.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              <div className="flex items-center justify-center gap-1">
                <Wrench className="w-4 h-4 text-primary" />
                <span className="text-sm">Mantenimiento Preventivo</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Tool className="w-4 h-4 text-primary" />
                <span className="text-sm">Control de Equipos</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Settings className="w-4 h-4 text-primary" />
                <span className="text-sm">Gestión Eficiente</span>
              </div>
            </div>
          </div>

          {/* Login card */}
          <Card className="w-full max-w-lg mx-auto lg:mx-0">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
              <CardDescription className="text-center">
                Ingresa tu cédula o correo y la contraseña para acceder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_or_cedula">Correo o Cédula</Label>
                  <Input
                    id="email_or_cedula"
                    name="email_or_cedula"
                    type="text"
                    value={formData.email_or_cedula}
                    placeholder="Ingresa tu correo o cédula"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      placeholder="********"
                      required
                      onChange={handleChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Botón para recuperar contraseña */}
                <div className="text-right -mt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/recuperar")}
                    className="text-sm text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Button variant="link" onClick={handleRegisterRedirect} className="p-0">
                  Regístrate
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
