"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Eye, EyeOff, Settings, Upload, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const validarCedulaEcuador = (cedula: string) => {
  if (cedula.length !== 10) return false;
  const digitoRegion = parseInt(cedula.substring(0, 2), 10);
  if (digitoRegion < 1 || digitoRegion > 24) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digitos = cedula.split("").map(Number);
  const verificador = digitos.pop();
  let suma = 0;

  digitos.forEach((digito, i) => {
    let producto = digito * coeficientes[i];
    if (producto >= 10) producto -= 9;
    suma += producto;
  });

  const residuo = suma % 10;
  const resultado = residuo === 0 ? 0 : 10 - residuo;
  return resultado === verificador;
};
type PasswordValidationKeys = 'length' | 'upperLower' | 'number';

const countryCodes = [
  { code: "+593", label: "Ecuador" },
  { code: "+1", label: "US" },
];

export default function Register() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    cedula: "",
    telefono: "",
    genero: "",
    codigoPais: "+593",
  });
  const [validations, setValidations] = useState({
    email: { isValid: false, exists: false },
    cedula: { isValid: false, exists: false },
    password: {
      length: false,
      upperLower: false,
      number: false,
    },
    passwordsMatch: true,
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    switch (name) {
      case "email":
        validateEmail(value);
        break;
      case "password":
        validatePassword(value);
        break;
      case "confirmPassword":
        validatePasswordMatch(value);
        break;
      case "cedula":
        validateCedula(value);
        break;
    }
  };

  const validateEmail = async (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailPattern.test(email);

    if (isValid) {
      try {
        const response = await fetch(`${process.env.API_BASE_URL}/check-mail/${email}`);
        const data = await response.json();
        setValidations(prev => ({
          ...prev,
          email: { isValid, exists: data.exists },
        }));
        if (data.exists) {
          toast({
            title: "Advertencia",
            description: "El correo ya está registrado.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Error al verificar el correo.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } else {
      setValidations(prev => ({
        ...prev,
        email: { isValid: false, exists: false },
      }));
    }
  };

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
      passwordsMatch: confirmPassword === formData.password,
    }));
  };

  const validateCedula = async (cedula: string) => {
    const isValid = validarCedulaEcuador(cedula);

    if (isValid) {
      try {
        const response = await fetch(`${process.env.API_BASE_URL}/check-cedula/${cedula}`);
        const data = await response.json();
        setValidations(prev => ({
          ...prev,
          cedula: { isValid, exists: data.exists },
        }));
        if (data.exists) {
          toast({
            title: "Advertencia",
            description: "La cédula ya está registrada.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Error al verificar la cédula.",
          variant: "destructive",
          duration: 1000,
        });
      }
    } else {
      setValidations(prev => ({
        ...prev,
        cedula: { isValid: false, exists: false },
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isFormValid =
      validations.email.isValid &&
      !validations.email.exists &&
      validations.cedula.isValid &&
      !validations.cedula.exists &&
      Object.values(validations.password).every(Boolean) &&
      validations.passwordsMatch;

    if (!isFormValid) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos correctamente.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "confirmPassword") formDataToSend.append(key, value);
      });

      if (profileImage && fileInputRef.current?.files?.[0]) {
        formDataToSend.append("foto_perfil", fileInputRef.current.files[0]);
      }

      const response = await fetch(`${process.env.API_BASE_URL}/register`, {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error en el registro.");
      }

      toast({
        title: "Éxito",
        description: "¡Casi listo! Tu registro se ha realizado correctamente. Recibirás un correo electrónico de confirmación cuando esté activa.",
        duration: 10000,
      });

      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message || "Error al registrar el usuario.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-gradient-to-br from-background to-secondary/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rotate-12 transform scale-150" />
      </div>

      <div className="container px-4 md:px-6 flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 w-full max-w-6xl items-center">
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left lg:pr-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Únete a Nuestro Sistema</h1>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Crea tu cuenta para acceder a todas las funcionalidades del sistema de gestión de mantenimiento industrial.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">¿Por qué registrarte?</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Acceso al sistema de mantenimiento</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Gestión de equipos y herramientas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Seguimiento de mantenimientos</span>
                </li>
              </ul>
            </div>
          </div>

          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Crear cuenta</CardTitle>
              <CardDescription className="text-center">
                Complete el formulario para registrarse en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personal">Datos Personales</TabsTrigger>
                    <TabsTrigger value="cuenta">Datos de Cuenta</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar 
                        className="w-24 h-24 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <AvatarImage src={profileImage || ""} />
                        <AvatarFallback>
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Elegir foto
                      </Button>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="nombres">Nombres</Label>
                          <Input
                            id="nombres"
                            name="nombres"
                            value={formData.nombres}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apellidos">Apellidos</Label>
                          <Input
                            id="apellidos"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cedula">Cédula</Label>
                        <Input
                          id="cedula"
                          name="cedula"
                          value={formData.cedula}
                          onChange={handleChange}
                          required
                        />
                        {formData.cedula && (
                          <div className="flex items-center gap-2 text-sm">
                            {validations.cedula.isValid && !validations.cedula.exists ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className={validations.cedula.isValid && !validations.cedula.exists ? "text-green-500" : "text-red-500"}>
                              {!validations.cedula.isValid ? "Cédula inválida" : 
                               validations.cedula.exists ? "Cédula ya registrada" : 
                               "Cédula válida"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="telefono">Teléfono</Label>
                          <div className="flex gap-2">
                            <Select 
                              value={formData.codigoPais}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, codigoPais: value }))}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Código" />
                              </SelectTrigger>
                              <SelectContent>
                                {countryCodes.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    {country.label} ({country.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              id="telefono"
                              name="telefono"
                              value={formData.telefono}
                              onChange={handleChange}
                              className="flex-1"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="genero">Género</Label>
                          <Select 
                            value={formData.genero}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, genero: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Masculino">Masculino</SelectItem>
                              <SelectItem value="Femenino">Femenino</SelectItem>
                              <SelectItem value="Otro">Prefiero no decirlo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cuenta" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        {formData.email && (
                          <div className="flex items-center gap-2 text-sm">
                            {validations.email.isValid && !validations.email.exists ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className={validations.email.isValid && !validations.email.exists ? "text-green-500" : "text-red-500"}>
                              {!validations.email.isValid ? "Correo inválido" : 
                               validations.email.exists ? "Correo ya registrado" : 
                               "Correo disponible"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                          </Button>
                        </div>
                        <div className="space-y-1">
  {(['length', 'upperLower', 'number'] as PasswordValidationKeys[]).map((key) => (
    <div className="flex items-center gap-2" key={key}>
      <div className={`h-1.5 w-1.5 rounded-full ${validations.password[key] ? "bg-green-500" : "bg-gray-300"}`} />
      <span className={`text-sm ${validations.password[key] ? "text-green-500" : "text-gray-500"}`}>
        {key === "length" ? "Mínimo 8 caracteres" : key === "upperLower" ? "Mayúsculas y minúsculas" : "Al menos un número"}
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
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                          </Button>
                        </div>
                        {formData.confirmPassword && !validations.passwordsMatch && (
                          <p className="text-sm text-red-500">Las contraseñas no coinciden</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button type="submit" className="w-full" disabled={
                  !formData.nombres || 
                  !formData.apellidos || 
                  !formData.email || 
                  !formData.password || 
                  !formData.confirmPassword || 
                  !formData.cedula || 
                  !formData.telefono || 
                  !formData.genero ||
                  !validations.email.isValid ||
                  validations.email.exists ||
                  !validations.cedula.isValid ||
                  validations.cedula.exists ||
                  !Object.values(validations.password).every(Boolean) ||
                  !validations.passwordsMatch
                }>
                  Crear cuenta
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Button variant="link" onClick={() => router.push("/login")} className="p-0">
                  Iniciar sesión
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
}