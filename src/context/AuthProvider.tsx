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
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Rutas exclusivas para INVITADOS (login y registros)
  const guestOnlyRoutes = ["/login", "/reset-password", "/createAccount"];
  const verificationRoutes = ["/verify-email"];
  
  // Rutas exclusivas para REGISTRADOS
  const protectedRoutes = ["/profile"]; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { firestore } = await import("../firebase/config");
          const userDoc = await getDoc(doc(firestore, "usuarios", currentUser.uid));
          const verifiedStatus = userDoc.exists() ? userDoc.data()?.emailVerificado : false;
          setIsVerified(verifiedStatus);

          if (!verifiedStatus && !verificationRoutes.includes(pathname)) {
            router.replace(`/verify-email?email=${encodeURIComponent(currentUser.email || "")}`);
          }
          
          if (verifiedStatus && (verificationRoutes.includes(pathname) || guestOnlyRoutes.includes(pathname))) {
            router.replace("/");
          }
        } catch (error) {
          console.error("Error comprobando verificación:", error);
        }
      } else if (protectedRoutes.includes(pathname)) {
        router.replace("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Entrando en Social Club...</p>
        </div>
      </div>
    );
  }

  if (user && isVerified && (guestOnlyRoutes.includes(pathname) || verificationRoutes.includes(pathname))) return null;
  if (user && !isVerified && !verificationRoutes.includes(pathname)) return null;
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
