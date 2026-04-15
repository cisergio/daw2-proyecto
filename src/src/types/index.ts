import type { Timestamp } from "firebase/firestore";

export type cliente = {
  nombre: string;
  apellidos: string;
  creacion: Timestamp;
  email: string;
  uaurio: string;
};

export type Post = {
  id:string;
  creador: {
    nombre: string;
    usuario: string;
    fotoPerfil:string;
  }
  contenido: string;
  adjunto: string;
  likes: number;
  createdAt: Timestamp;
};
