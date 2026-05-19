import type { Timestamp } from "firebase/firestore";

export type cliente = {
  uid: string;
  nombre: string;
  apellidos: string;
  creacion: Timestamp;
  email: string;
  usuario: string;
  fotoPerfil?: string;
  fotoPortada?: string;
  biografia?: string;
  seguidores?: number;
  seguidos?: number;
  emailVerificado:boolean
};

export type Post = {
  id:string;
  creador: {
    uid: string;
    nombre: string;
    usuario: string;
    fotoPerfil: string;
  }
  contenido: string;
  adjunto: string;
  likes: number;
  numComments?: number;
  createdAt: Timestamp;
  likedByMe?: boolean;
};

export type PostComment = {
  id: string;
  contenido: string;
  creador: {
    uid: string;
    usuario: string;
    fotoPerfil?: string;
  };
  createdAt: Timestamp;
};
