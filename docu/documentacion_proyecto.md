# Resumen y Flujo del Social Club

A continuación se detalla la estructura, flujo y características avanzadas técnicas que componen la red social *Juan de Colonia Social Club*, separadas por secciones lógicas.

---

## 🏗️ Arquitectura y Seguridad Global
El proyecto es una SPA modernizada usando **Next.js (App Router)** y **Firebase**.
La seguridad se rige por un componente clave: [AuthProvider.tsx](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/context/AuthProvider.tsx).
*   **Guardián Central ([AuthProvider.tsx](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/context/AuthProvider.tsx)):** Escucha cambios de sesión (`onAuthStateChanged`). Al entrar, verifica si el `.emailVerificado` del documento de Firestore es verdadero.
    *   Si eres **invitado**: Solo puedes ir a `/login`, `/createAccount` o `/reset-password`.
    *   Si estás **no verificado**: Eres encerrado en la ruta `/verify-email`.
    *   Si estás **verificado**: Entras a la app, tu perfil y el feed.
*   **Segmentación Cliente/Servidor:** Se leen datos en **tiempo real** en el cliente (Hooks), pero **todas las escrituras** ocurren en el servidor (`Server Actions`), usando Firebase Admin SDK, lo que salta reglas limitantes de cliente y aporta control de seguridad 100% sobre la base de datos y Storage.

---

## 📖 Flujos por Página y Server Actions

### 1. Autenticación (`/login` & `/createAccount`)
*   **Front-end:** Diseño premium con transiciones suaves. El registro requiere nombre, usuario (validado Regex sin espacios), email corporativo (obligatorio termina en `@educa.jcyl.es`) y clave robusta.
*   **Server Action - [creacionUsuario.ts](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/app/actions/creacionUsuario.ts):**
    1.  Recibe la data y hace consulta en Firestore para evitar que el `@username` esté duplicado.
    2.  Crea la identidad en *Auth* (`createUser`) si todo está correcto.
    3.  Construye el documento del usuario en Firestore (donde setea `emailVerificado: false`).
    4.  Desencadena el envío del código OTP de 6 dígitos al correo usando NodeMailer.

### 2. El Feed Principal ([/page.tsx](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/app/page.tsx))
*   **Front-end:** Es el muro de la red social. Presenta un componente de "scroll infinito" manual apoyado en un genérico `IntersectionObserver` y manejado por el Hook [usePost.ts](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/hooks/usePost.ts).
*   **Características destacadas:**
    *   Mantiene un contador paralelo de *Posts pendientes*. Si alguien (incluido tú de otra pestaña) publica un post nuevo, el feed no se recarga abruptamente. Aparece un **badge tipo Twitter** que dice *"Ver X publicaciones nuevas"*, manteniendo el scroll intacto hasta que decides pulsar.
    *   Componentes en miniatura desvinculados: El Avatar y Username de cada post envueltos en utilidades (`RealTimeAvatar`), así, aunque Firebase cachee la data, siempre ves la imagen más reciente del usuario.

### 3. Creación de un Post ([/create-post/page.tsx](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/app/create-post/page.tsx))
*   **Front-end:** Textarea limitado (280 caracteres) con contador animado dinámico y vista previa local de imagen.
    *   Punto fuerte: Evita *fat-finger errors* o abandonar página en plena subida con interceptores (`window.history.pushState` para atajar el botón atrás y `beforeunload` para no cerrar la tap).
*   **Server Action - [subirPost.ts](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/app/actions/subirPost.ts):**
    1.  No se fía del cliente: Consulta al perfil del usuario actual para extraer su nombre y foto real.
    2.  Procesa el **Buffer** del `FormData` de la imagen si se adjuntó. Construye un `safeFileName` y se sube a Cloud Storage garantizando que es público.
    3.  Inserta el documento final del post en Firestore.

### 4. Perfil del Usuario (`/profile/[uid]/page.tsx` y `/edit`)
*   **Perfil Público:**
    *   Analiza si la URL actual pertenece al propio usuario ("Editar") o a un tercero ("Seguir").
    *   Muestra el recuento de seguidores/seguidos extraído de contadores agregados (no de recuentos costosos al vuelo).
    *   Consulta la base de datos de Posts, filtrando únicamente los del [uid](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/app/profile/%5Buid%5D/page.tsx#36-40) asociado.
*   **El poderoso [editarPerfil.ts](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/app/actions/editarPerfil.ts):**
    *   No se trata de un simple `update()`. Para que Firebase sea rápido a la hora de leer `Posts`, se hace algo llamado **Desnormalización**: La foto de perfil va pegada a cada Post.
    *   ¿Qué pasa si a los 6 meses el usuario cambia su foto? En el servidor se aplica un barrido. Busca todos los posts (`collection("posts")`) y todos los sub-comentarios distribuidos de ese creador (`collectionGroup("comments")`) y ejecuta un super-batch-update (`adminFirestore.batch()`) que propaga la nueva imagen y el nuevo `@username` a la historia entera del usuario de forma inmediata.

### 5. Detalle de publicación (`/post/[id]/page.tsx`)
*   **Front-end:** Vista unificada de un post grande más el componente de la sección de comentarios (`CommentSection`).
*   **Comentarios:** Integrado con los mismos botones de Like y menús de acciones de 3 puntos.
*   **Acciones Destructivas ([eliminarPost.ts](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/app/actions/eliminarPost.ts), [eliminarComment.ts](file:///c:/Users/Administrator/Desktop/JuanDeColonia_SocialClub/daw2-proyecto/src/app/actions/eliminarComment.ts)):** 
    *   Estas Server Actions verifican primero con el Admin SDK que la solicitud la está haciendo **el autor original**.
    *   Luego, borran ordenadamente (1) la imagen en Cloud Storage del archivo adjunto para no llenar basura, y (2) borran document y sus notificaciones anidadas, restando finalmente "-1" o en los contadores del perfil del responsable.
