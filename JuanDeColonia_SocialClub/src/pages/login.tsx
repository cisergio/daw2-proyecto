import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 ">
      <div className="p-8 border border-gray-200 bg-white rounded-lg shadow-md w-96 overflow-hidden">

        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="box-border w-full p-2 border border-gray-300 rounded-md"
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="box-border w-full p-2 border border-gray-300 rounded-md"
          />

          <button className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
            Entrar
          </button>
          
        </form>
      </div>
    </div>
  );
}
