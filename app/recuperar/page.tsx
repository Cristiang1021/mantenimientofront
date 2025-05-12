"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, LockKeyhole, Mail, Eye, EyeOff, Check, X, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

type PasswordValidationKeys = 'length' | 'upperLower' | 'number';

export default function RecuperarContrasena() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validations, setValidations] = useState({
    password: {
      length: false,
      upperLower: false,
      number: false,
    },
    passwordsMatch: false
  })
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  useEffect(() => {
    validatePassword(newPassword)
  }, [newPassword])

  useEffect(() => {
    validatePasswordMatch(confirmPassword)
  }, [confirmPassword, newPassword])

  const validatePassword = (password: string) => {
    setValidations(prev => ({
      ...prev,
      password: {
        length: password.length >= 8,
        upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
        number: /\d/.test(password),
      }
    }));
  };

  const validatePasswordMatch = (confirmPassword: string) => {
    setValidations(prev => ({
      ...prev,
      passwordsMatch: confirmPassword === newPassword && confirmPassword !== "",
    }));
  };

  const isPasswordValid = () => {
    return Object.values(validations.password).every(Boolean) && validations.passwordsMatch;
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.API_BASE_URL}/enviar-codigo-recuperacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.mensaje || "Error al enviar el código. Por favor, inténtelo nuevamente.")
        return
      }

      setStep(2)
      // Focus the first input field when the code step is shown
      setTimeout(() => {
        if (codeInputRefs.current[0]) {
          codeInputRefs.current[0].focus()
        }
      }, 100)
    } catch (error) {
      console.error("Error al solicitar recuperación:", error)
      setError("Error al enviar el código. Por favor, inténtelo nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    // Update the code array
    const newCode = [...verificationCode]
    newCode[index] = value

    setVerificationCode(newCode)

    // Auto-advance to next field if a digit was entered
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
    // Move to next input on right arrow
    else if (e.key === 'ArrowRight' && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
    // Move to previous input on left arrow
    else if (e.key === 'ArrowLeft' && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    
    // If pasted data is a 6-digit number, fill all inputs
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setVerificationCode(digits)
      
      // Focus the last input
      codeInputRefs.current[5]?.focus()
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const code = verificationCode.join('')
    
    // Validate that all 6 digits are entered
    if (code.length !== 6) {
      setError("Por favor, ingrese el código completo de 6 dígitos")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.API_BASE_URL}/verificar-codigo-recuperacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo: code }),
      })

      if (!response.ok) throw new Error("Código de verificación incorrecto")

      setStep(3)
    } catch (error) {
      console.error("Error al verificar código:", error)
      setError("Código incorrecto. Por favor, verifique e intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.API_BASE_URL}/enviar-codigo-recuperacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.mensaje || "Error al enviar un nuevo código. Por favor, inténtelo nuevamente.")
        return
      }

      // Reset verification code inputs
      setVerificationCode(["", "", "", "", "", ""])
      
      // Focus the first input
      setTimeout(() => {
        if (codeInputRefs.current[0]) {
          codeInputRefs.current[0].focus()
        }
      }, 100)
      
    } catch (error) {
      console.error("Error al reenviar código:", error)
      setError("Error al enviar un nuevo código. Por favor, inténtelo nuevamente.")
    } finally {
      setResendLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!isPasswordValid()) {
      setError("Por favor, asegúrese de que la contraseña cumpla con todos los requisitos")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.API_BASE_URL}/verificar-codigo-recuperacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          codigo: verificationCode.join(''),
          nueva_password: newPassword,
        }),
      })

      if (!response.ok) throw new Error("No se pudo cambiar la contraseña")

      setStep(4)
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      setError("Error al cambiar la contraseña. Por favor, inténtelo nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo o Cédula</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo o cédula"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar código de verificación"
              )}
            </Button>
          </form>
        )

      case 2:
        return (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="space-y-4">
              <Label htmlFor="code" className="text-center block">Código de verificación</Label>
              
              <div className="flex justify-center gap-2">
                {verificationCode.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { codeInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-medium"
                    required
                  />
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Hemos enviado un código de verificación a tu correo electrónico.
                Por favor revisa tu bandeja de entrada y spam.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar código"
                )}
              </Button>
              
              <div className="relative my-2">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">o</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleResendCode}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    No recibiste el código? Solicitar nuevo
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full mt-2"
                onClick={() => setStep(1)}
                disabled={loading || resendLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>
          </form>
        )

      case 3:
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  required
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
              <div className="space-y-1">
                {(['length', 'upperLower', 'number'] as PasswordValidationKeys[]).map((key) => (
                  <div className="flex items-center gap-2" key={key}>
                    <div className={`h-1.5 w-1.5 rounded-full ${validations.password[key] ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className={`text-sm ${validations.password[key] ? "text-green-500" : "text-gray-500"}`}>
                      {key === "length" ? "Mínimo 8 caracteres" : 
                       key === "upperLower" ? "Mayúsculas y minúsculas" : 
                       "Al menos un número"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </span>
                </Button>
              </div>
              {confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  {validations.passwordsMatch ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={validations.passwordsMatch ? "text-green-500" : "text-red-500"}>
                    {validations.passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !isPasswordValid()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cambiando contraseña...
                  </>
                ) : (
                  "Cambiar contraseña"
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>
          </form>
        )

      case 4:
        return (
          <div className="space-y-4 text-center">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <LockKeyhole className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium">¡Contraseña cambiada con éxito!</h3>
            <p className="text-muted-foreground">
              Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Button 
              className="w-full" 
              onClick={() => router.push("/login")}
            >
              Ir a iniciar sesión
            </Button>
          </div>
        )
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Recuperar contraseña"
      case 2:
        return "Verificar código"
      case 3:
        return "Nueva contraseña"
      case 4:
        return "¡Éxito!"
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Ingresa tu correo o cédula para recibir un código de verificación"
      case 2:
        return "Ingresa el código de 6 dígitos enviado a tu correo"
      case 3:
        return "Crea una nueva contraseña segura para tu cuenta"
      case 4:
        return "Tu contraseña ha sido actualizada correctamente"
    }
  }

  const getLeftSideContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Recupera el acceso a tu cuenta
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Sigue estos sencillos pasos para recuperar el acceso a tu cuenta y continuar gestionando el mantenimiento de tu maquinaria industrial.
            </p>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Proceso seguro en 3 pasos:</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Verifica tu identidad con tu correo o cédula</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Ingresa el código de verificación enviado</span>
                </li>
                <li className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-primary" />
                  <span>Crea una nueva contraseña segura</span>
                </li>
              </ul>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Verifica tu identidad
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hemos enviado un código de verificación a tu correo electrónico para confirmar tu identidad y proteger tu cuenta.
            </p>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Consejos importantes:</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Revisa tu bandeja de entrada y carpeta de spam</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <span>El código expira en 10 minutos</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <span>Si no lo recibes, puedes solicitar uno nuevo</span>
                </li>
              </ul>
            </div>
          </>
        )
      case 3:
        return (
          <>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Crea una contraseña segura
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Una contraseña fuerte es esencial para mantener la seguridad de tu cuenta y proteger la información de tu empresa.
            </p>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Recomendaciones de seguridad:</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Usa al menos 8 caracteres</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Combina mayúsculas y minúsculas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Incluye números y símbolos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Evita información personal fácil de adivinar</span>
                </li>
              </ul>
            </div>
          </>
        )
      case 4:
        return (
          <>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              ¡Recuperación exitosa!
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Has recuperado el acceso a tu cuenta de forma segura. Ahora puedes volver a gestionar el mantenimiento de tu maquinaria industrial.
            </p>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Consejos de seguridad:</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Nunca compartas tu contraseña con nadie</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Cambia tu contraseña periódicamente</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Cierra sesión al terminar de usar equipos compartidos</span>
                </li>
              </ul>
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gradient-to-br from-background to-secondary/20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rotate-12 transform scale-150" />
      </div>

      <div className="container px-4 md:px-6 flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 w-full max-w-6xl items-center">
          {/* Left side - Informational content */}
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left lg:pr-8">
            <div className="space-y-2">
              {getLeftSideContent()}
            </div>
          </div>

          {/* Right side - Form card */}
          <Card className="w-full max-w-lg mx-auto lg:mx-0">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                {step === 4 ? (
                  <LockKeyhole className="w-8 h-8 text-primary" />
                ) : (
                  <Mail className="w-8 h-8 text-primary" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                {getStepTitle()}
              </CardTitle>
              <CardDescription className="text-center">
                {getStepDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStep()}
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="text-sm text-muted-foreground">
                ¿Recordaste tu contraseña?{" "}
                <Button variant="link" onClick={() => router.push("/login")} className="p-0">
                  Iniciar sesión
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
