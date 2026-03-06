import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase/config";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Páginas y componentes
import Login from "./pages/login";
import Layout from "./pages/Layout";
import ResetPassword from "./pages/resetPassword";

/**
 * Componente para las rutas protegidas. Accesibles solo tras iniciar sesión.
 */
function ProtectedRoutes() {
  const location = useLocation();

  // AÑADIMOS ESTA GUARDIA INTELIGENTE:
  // Si el usuario está autenticado (por eso se renderiza este componente)
  // pero la URL sigue siendo una de las públicas, lo redirigimos a la raíz.
  if (["/login", "/reset-password"].includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  // Si la URL es correcta, procedemos con el enrutamiento normal del área protegida.
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Este comodín ahora solo aplica dentro del mundo protegido */}
        <Route
          path="*"
          element={
            <h1 className="text-center font-bold">PÁGINA NO ENCONTRADA</h1>
          }
        />
      </Route>
    </Routes>
  );
}

/**
 * Componente para las rutas públicas. No cambia.
 */
function PublicRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Si un usuario no logueado intenta ir a cualquier otra ruta, se le redirige a /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="text-center mt-20 font-semibold">Cargando...</p>;
  }

  return (
    <BrowserRouter>
      {/* Mantenemos la lógica principal simple que ya entendías */}
      {user ? <ProtectedRoutes /> : <PublicRoutes />}
    </BrowserRouter>
  );
}

export default App;
