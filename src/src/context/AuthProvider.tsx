"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/config";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "../components/Layout";

// Creamos un contexto por si en el futuro necesitas saber quién es el usuario logueado en otros archivos
const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Rutas exclusivas para INVITADOS (login y registros). Si tienes sesión, te empuja a la portada ("/")
  const guestOnlyRoutes = ["/login", "/reset-password", "/createAccount"];
  
  // Rutas exclusivas para REGISTRADOS. Si NO tienes sesión, te empuja al login
  // NOTA: Dejamos el listado vacío momentáneamente (solo "/profile") porque el Feed ("/") ya es público
  const protectedRoutes = ["/profile"]; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Guardia para usuarios con sesión (No dejes que vayan al login)
        if (guestOnlyRoutes.includes(pathname)) {
          router.replace("/");
        }
      } else {
        // Guardia para usuarios anónimos (Si intentan algo privado como modificar su perfil, al login)
        if (protectedRoutes.includes(pathname)) {
          router.replace("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-500">Cargando aplicación...</p>
      </div>
    );
  }

  // Prevenir parpadeos cuando Next.js re-renderiza y está en proceso de redirigir
  if (user && guestOnlyRoutes.includes(pathname)) return null;
  if (!user && protectedRoutes.includes(pathname)) return null;

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!guestOnlyRoutes.includes(pathname) ? (
        <DashboardLayout>{children}</DashboardLayout>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
