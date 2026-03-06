import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ResetPassword() {
  const [email, setEmail] = useState<string>("");
  const [enviado, setEnviado] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Hemos renombrado la función para que sea más clara
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Limpiamos ambos estados al iniciar el proceso.
    setError(null);
    setEnviado(false);

    if (!email) {
      setError("Por favor, introduce tu correo electrónico.");
      return;
    }

    try {
      // 2. Intentamos enviar el correo.
      await sendPasswordResetEmail(auth, email);

      // 3. ¡LA LÓGICA CORRECTA!
      // Solo si la línea anterior NO da error, entonces y solo entonces
      // marcamos el correo como enviado.
      setEnviado(true);
    } catch (error: any) {
      // 4. Si la promesa de `sendPasswordResetEmail` falla, caemos aquí.
      // El estado `enviado` nunca se puso a `true`.
      console.error("Error al enviar el correo", error);
      setError(
        "No se pudo enviar el correo. Revisa que la dirección sea correcta.",
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-gray-500 mb-6">
            Introduce tu email para recuperar tu cuenta.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Enviar Correo de Recuperación
              </button>
            </div>
          </form>

          {/* Ahora esto funcionará como esperas: o se muestra uno, o el otro, pero nunca los dos. */}
          {enviado && (
            <div className="mt-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md text-left">
              <p className="font-semibold">¡Correo enviado!</p>
              <p className="text-sm">
                Revisa tu bandeja de entrada (y spam) para continuar.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md text-left">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 text-sm">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
