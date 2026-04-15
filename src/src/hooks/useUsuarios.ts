"use client";
import { firestore as bd } from "../firebase/config";
import { setDoc, doc, Timestamp } from "firebase/firestore";

export async function crearUsuario(
  nombre: string,
  apellidos: string,
  usuario: string,
  email: string,
) {
  const id = crearId(nombre, apellidos, usuario);

  try {
    await setDoc(doc(bd, "usuarios", id), {
      nombre: nombre,
      apellidos: apellidos,
      usuario: usuario,
      email: email,
      creacion: Timestamp.fromDate(new Date()),
    });
  } catch (error: any) {
    console.log(error.message);
  }
}

function crearId(nombre: string, apellidos: string, usuario: string) {
  return nombre + apellidos + usuario;
}
