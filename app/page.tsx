/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { ArrowRight, CheckCircle, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png" // Cambia a la ruta de tu logo
              alt="Logo"
              className="h-20 w-20"
            />
            <span className="text-2xl font-bold text-green-600">
              INGEMA 3R
            </span>
          </div>
          {/* Botón de Inicio de Sesión */}
          <Button onClick={() => (window.location.href = "/login")}>
            Iniciar Sesión
          </Button>
        </nav>
      </header>

      {/* Main */}
      <main className="container mx-auto px-1 py-2">
        {/* Título y descripción */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Bienvenido al Sistema de Gestión de Mantenimiento Industrial
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Un espacio exclusivo para optimizar la gestión de maquinaria y
            procesos industriales en INGEMA 3R.
          </p>
        </div>

        {/* Características principales */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="mr-2 h-5 w-5 text-blue-600" />
                Gestión de Mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Organiza y supervisa el mantenimiento de todas tus máquinas con
                eficiencia y precisión.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                Asignación de Tareas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Facilita la asignación de actividades al personal operativo,
                maximizando la productividad.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                Reportes Detallados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Visualiza reportes de mantenimientos realizados, pendientes y
                estadísticas clave.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Beneficios */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">¿Por qué elegirnos?</h2>
          <ul className="space-y-4">
            <li className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              <span>Automatización de procesos y mayor eficiencia.</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              <span>Control centralizado de todos los mantenimientos.</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              <span>Mejora de la seguridad y productividad.</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              <span>Datos en tiempo real para una mejor toma de decisiones.</span>
            </li>
          </ul>
        </div>

        {/* Llamado a la acción */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            ¿Listo para comenzar con INGEMA 3R?
          </h2>
          <Button size="lg" className="text-lg" onClick={() => (window.location.href = "/login")}>
            Iniciar Ahora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 INGEMA 3R. Todos los derechos reservados.</p>
          <div className="mt-4 space-x-4">
            <a href="#" className="hover:text-blue-600">
              Términos de Servicio
            </a>
            <a href="#" className="hover:text-blue-600">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-blue-600">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
