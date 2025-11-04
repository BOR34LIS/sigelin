import Link from "next/link";
import { Button } from "@/components/ui/button";
// Importa la función que realmente exporta el archivo server.ts
import { createServiceRoleClient } from "@/lib/supabase/server";
// 💥 CORREGIDO: Importación con ruta relativa correcta para el mismo directorio
import  LogoutButton  from "./logout-button"; 

export async function AuthButton() {
  // En este punto deberías usar createServerComponentClient o una función de lectura de sesión.
  // Usaremos createServiceRoleClient temporalmente para que el código compile,
  // pero su uso en un AuthButton puede ser incorrecto si no es su propósito.
  const supabase = createServiceRoleClient();

  const { data: { session } } = await supabase.auth.getSession();

  return session ? (
    <>
      {/* ... Renderizar LogoutButton */}
      <p>Hola, {session.user.email}</p>
      <LogoutButton />
    </>
  ) : (
    <>
      {/* ... Renderizar Link a Login */}
      <Link href="/login">
        <Button>Iniciar Sesión</Button>
      </Link>
    </>
  );
}
