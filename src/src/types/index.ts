import type { Timestamp } from "firebase/firestore";

export type cliente = {
  nombre: string;
  apellidos: string;
  creacion: Timestamp;
  email: string;
  uaurio: string;
};

export type post = {
  creador: string;
  contenido: string;
  adjunto: string;
  likes: number;
};
