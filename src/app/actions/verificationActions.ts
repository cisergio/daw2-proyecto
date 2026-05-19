"use server"
import { adminFirestore } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function enviarCorreoConfirmacion(email: string) {
  try {
    const codigoGenerado = await generarCodigo();
    
    // Guardar el código en Firestore
    await adminFirestore.collection("verificationCodes").doc(`${codigoGenerado}_${email}`).set({
      createdAt: Timestamp.now(),
      email: email,
      code: codigoGenerado
    });

    // Enviar el correo con un diseño premium (HTML)
    await adminFirestore.collection("mail").add({
      to: email,
      message: {
        subject: "🔑 Tu Código de Verificación - Juan de Colonia Social Club",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px; color: #0f172a;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                <h1 style="color: #d97706; margin: 0; font-size: 24px; letter-spacing: 2px;">SOCIAL CLUB</h1>
              </div>
              <div style="padding: 40px; text-align: center;">
                <h2 style="font-size: 20px; margin-bottom: 10px; color: #0f172a;">Verifica tu correo</h2>
                <p style="color: #64748b; font-size: 14px; line-height: 1.5;">Gracias por unirte a nuestra comunidad. Usa el siguiente código para completar tu registro:</p>
                
                <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border: 2px dashed #d97706; border-radius: 12px;">
                  <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #d97706;">${codigoGenerado}</span>
                </div>
                
                <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">
                  Si no has solicitado este código, puedes ignorar este correo de forma segura.
                </p>
              </div>
              <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                © 2026 Juan de Colonia Social Club. Todos los derechos reservados.
              </div>
            </div>
          </div>
        `,
        text: `Tu código de verificación para Juan de Colonia Social Club es: ${codigoGenerado}`
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error al enviar correo de confirmación:", error);
    return { success: false, error: "No se pudo enviar el correo de confirmación." };
  }
}


async function generarCodigo() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let codigo = "";
  
  for (let i = 0; i < 6; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
    codigo += caracteres.charAt(indiceAleatorio);
  }
  
  return codigo;
}


export async function verificacionCodigo(email:string, codigo:string) {
      try {
    const docId=codigo+"_"+email;

    const docSnap = await adminFirestore.collection("verificationCodes").doc(docId).get()

    if(!docSnap.exists){
             return { success: false, error: "El código no es correcto o ha expirado." };
        }

       const userQuery=await adminFirestore.collection("usuarios").where("email", "==", email).limit(1).get();
       
       if(userQuery.empty){
        return { success: false, error: "Usuario no encontrado." };
       }
    
       const userDoc = userQuery.docs[0];

       await userDoc.ref.update({
        emailVerificado:true
       })

       await adminFirestore.collection("verificationCodes").doc(docId).delete();
    return { success: true, message: "¡Correo verificado con éxito!" };
  } catch (error) {
    console.error("Error verificando código:", error);
    return { success: false, error: "Hubo un error al verificar el código." };
  }
}
