"use client";
import { useState, useCallback, useEffect } from "react";
import { firestore as bd } from "../firebase/config";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  onSnapshot,
  where,
  QueryDocumentSnapshot,
  getDoc,
  doc
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import type { Post } from "../types";

export function usePost() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);

  // 1. Conseguir los primeros 10 posts
  const getInitialPosts = useCallback(async () => {
    setLoading(true);
    try {
      const postsRef = collection(bd, "posts");
      // Asumimos que el campo de fecha se llama "createdAt" (cámbialo si se llama "fecha" u otra cosa)
      const q = query(postsRef, orderBy("createdAt", "desc"), limit(10));
      
      const snapshot = await getDocs(q);
      const postArray: Post[] = [];
      
      snapshot.forEach((doc) => {
        postArray.push({ id: doc.id, ...doc.data() } as Post);
      });

      setPosts(postArray);

      // Guardamos el último documento para la siguiente partición
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc || null);
      
      // Si nos devolvieron menos de 10, es que ya no hay más en la base de datos
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error cargando los posts iniciales:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMorePosts = useCallback(async () => {
    // Si ya estamos cargando o no hay más posts, no hacemos nada
    if (loading || !hasMore || !lastVisible) return;

    setLoading(true);
    try {
      const postsRef = collection(bd, "posts");
      const q = query(
        postsRef,
        orderBy("createdAt", "desc"),
        startAfter(lastVisible), // Empezar DESPUÉS del último post actual
        limit(10)
      );

      const snapshot = await getDocs(q);
      const postArray: Post[] = [];

      snapshot.forEach((doc) => {
        postArray.push({ id: doc.id, ...doc.data() } as Post);
      });

      // Añadimos los nuevos posts al array que ya teníamos (concatenamos)
      setPosts((prevPosts) => [...prevPosts, ...postArray]);

      // Guardamos el último documento de esta nueva tanda
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc || null);
      
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error cargando más posts:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, lastVisible]);

  // 3. Listener en tiempo real para detectar publicaciones nuevas
  useEffect(() => {
    // Si no hay posts iniciales cargados, no tiene sentido escuchar "novedades"
    if (posts.length === 0) return;

    // Tomamos la fecha del post más reciente que tenemos en pantalla (el primero del array)
    const latestPostDate = posts[0].createdAt;
    if (!latestPostDate) return;

    const postsRef = collection(bd, "posts");
    const q = query(
      postsRef,
      where("createdAt", ">", latestPostDate),
      orderBy("createdAt", "desc")
    );

    // Creamos la suscripción a Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries: Post[] = [];
      snapshot.forEach((doc) => {
        // Evitamos duplicar posts que ya pudieran estar en pendientes o en el feed
        const exists = posts.some(p => p.id === doc.id) || pendingPosts.some(p => p.id === doc.id);
        if (!exists) {
          newEntries.push({ id: doc.id, ...doc.data() } as Post);
        }
      });

      if (newEntries.length > 0) {
        // Acumulamos los nuevos posts encontrados
        setPendingPosts((prev) => {
          const combined = [...newEntries, ...prev];
          // Eliminamos duplicados por ID por seguridad
          return Array.from(new Map(combined.map(p => [p.id, p])).values());
        });
      }
    });

    // Limpiamos el listener cuando el componente se desmonte o cambie el post de referencia
    return () => unsubscribe();
  }, [posts[0]?.id]); // Solo se reinicia si el ID del primer post cambia

  // 4. Función para inyectar los posts pendientes en el feed principal
  const showNewPosts = useCallback(() => {
    if (pendingPosts.length === 0) return;

    setPosts((prev) => [...pendingPosts, ...prev]);
    setPendingPosts([]);
    
    // Nota: El scroll hacia arriba debe dispararse en el componente que use esta función
  }, [pendingPosts, setPosts]);

  // 5. Función para actualizar un post específico (ej: likes)
  const updatePost = useCallback((postId: string, newData: Partial<Post>) => {
    setPosts((prev) => 
      prev.map((p) => (p.id === postId ? { ...p, ...newData } : p))
    );
  }, [setPosts]);

  return {
    posts,
    loading,
    hasMore,
    getInitialPosts,
    getMorePosts,
    pendingPosts,
    showNewPosts,
    updatePost
  };
}


/**
 * Hook para obtener las publicaciones de un usuario específico.
 * @param usuarioId ID del usuario (UID de Firebase Auth).
 * @returns { posts, loading, error }
 */
export function useUserPosts(usuarioId: string | null | undefined) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!usuarioId) {
            setLoading(false);
            return;
        }

        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const collRef = collection(bd, "posts");

                // Buscamos posts donde el creador sea el usuarioId
                const q = query(
                    collRef,
                    where("creador.uid", "==", usuarioId),
                    orderBy("createdAt", "desc"),
                    limit(10)
                );

                const querySnapshot = await getDocs(q);
                const postsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Post[];

                setPosts(postsList);

                if (postsList.length === 0) {
                    console.log("No se encontraron posts para el usuario:", usuarioId);
                }
            } catch (err: any) {
                console.error("Error fetching user posts:", err);
                setError("Error al cargar las publicaciones del usuario.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [usuarioId]);

    // Función para actualizar un post específico (ej: likes)
    const updatePost = useCallback((postId: string, newData: Partial<Post>) => {
        setPosts((prev) => 
            prev.map((p) => (p.id === postId ? { ...p, ...newData } : p))
        );
    }, []);

    return { posts, loading, error, updatePost };
}

/**
 * Hook para obtener un post específico por su ID.
 * @param idPost ID del post en Firestore.
 * @returns { post, loading, error }
 */
export function usePostId(idPost: string | null | undefined) {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!idPost) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(bd, "posts", idPost);
    
    // Suscripción en tiempo real para captar cambios (como likes) inmediatamente
    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
        } else {
          setError("No se encontró el post con el ID proporcionado.");
        }
        setLoading(false);
      }, 
      (err) => {
        console.error("Error en la suscripción del post:", err);
        setError("Error al cargar la publicación en tiempo real.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [idPost]);


  return { post, error, loading };
}