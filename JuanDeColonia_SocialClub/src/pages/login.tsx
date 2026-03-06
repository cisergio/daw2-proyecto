import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { Link } from "react-router-dom"; // 1. IMPORTAMOS Link EN LUGAR DE NavLink

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores de UI

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reseteamos el error en cada intento
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El `onAuthStateChanged` en App.tsx se encargará de la redirección
    } catch (error: any) {
      // Mostramos un mensaje de error más amigable en la UI
      setError(
        "Credenciales incorrectas. Por favor, verifica tu email y contraseña.",
      );
      console.error("Error de autenticación:", error.code, error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-center mb-6">
            <span className="bg-blue-600 p-3 rounded-xl shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082m.75.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082m-1.5 0c.251.023.501.05.75.082m0 0c.251.023.501.05.75.082M12 21v-8.283m0 0c.251.023.501.05.75.082m-1.5 0c.251.023.501.05.75.082m0 0c.251.023.501.05.75.082"
                />
              </svg>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Acceso al Panel
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Introduce tus credenciales para continuar
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="text-sm text-right">
              <Link
                to="/createAccount"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                ¿No tienes una cuenta?              </Link>
            </div>



            {/* 2. ENLACE A LA PÁGINA DE RESETEO DE CONTRASEÑA */}
            <div className="text-sm text-right">
              <Link
                to="/reset-password"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                ¿Has olvidado tu contraseña?
              </Link>
            </div>

            {/* Mensaje de error, se mostrará solo si hay un error */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
