"use client";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useState } from "react";
import Link from "next/link";
import { crearUsuario } from "../../hooks/useUsuarios";

export default function CreateAccount() {
  const [email, setEmail] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [apellidos, setApellidos] = useState<string>("");
  const [usuario, setUsuario] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [iniciado, setIniciado] = useState<string | null>(null);

  const handleSingUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await crearUsuario(nombre, apellidos, usuario, email);
      await createUserWithEmailAndPassword(auth, email, password);
      await signOut(auth);
      setIniciado("Perfecto se ha creado la cuenta vuelve a iniciar sesion");
    } catch (error: any) {
      setError("Error al crear la cuenta. Por favor, inténtalo de nuevo");
      console.error("Code: ", error.code, "Message: ", error.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <span className="form-icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="form-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
        </div>
        <h2 className="form-title">Crear Nueva Cuenta</h2>
        <p className="form-subtitle">Completa el formulario para registrarte</p>

        <form onSubmit={handleSingUp} className="form-body">
          <div className="form-input-group">
            <label htmlFor="name" className="form-label">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="form-input"
              placeholder="Como te llamas?"
              pattern="^[A-Za-zÀ-ÿñÑ]+$"
              title="Dudo que tu nombre tenga esos caracteres tan raros"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="apellidos" className="form-label">
              Apellidos
            </label>
            <input
              id="apellidos"
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
              className="form-input"
              placeholder="Tus apellidos: "
              pattern="^[A-Za-z]+$"
              title="Dudo que tu apellido tenga esos caracteres tan raros"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="usuario" className="form-label">
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              className="form-input"
              placeholder="Que @ quieres que la gente te vea"
              pattern="[a-zA-ZÀ-ÿñÑ0-9._\-]{2,20}"
              title="Solo se permiten letras, numeros y guion bajos y medios. Max: 20 caracteres"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              pattern="[\s\S]{6,50}"
              title="Min 6 caracteres, max 50"
              placeholder="Contraseña"
            />
          </div>

          <div className="mt-6 text-sm">
            <Link href="/login" className="form-link">
              Volver a Iniciar Sesión
            </Link>
          </div>

          {error && <div className="form-error">{error}</div>}
          {iniciado && <div className="form-success">{iniciado}</div>}

          <div>
            <button type="submit" className="form-button">
              Crear Cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
