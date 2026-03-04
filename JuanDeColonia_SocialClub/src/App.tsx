import "./App.css";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/config";
import type { User } from "firebase/auth";
import Login from "./pages/login";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);
      setCargando(false);
    });
  }, []);

  if (cargando) return <p>Cargando...</p>;
  if (!user) return <Login />;

  return (
    <div>
      <button onClick={handleLogout}>Cerrar sesion</button>
    </div>
  );
}

export default App;
