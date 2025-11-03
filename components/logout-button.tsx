"use client";

// CORREGIDO: Importa la instancia 'supabase', no la función 'createClient'
import { supabase } from "@/lib/supabase/client"; 
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    // Usamos la instancia 'supabase' directamente
    const { error } = await supabase.auth.signOut(); 

    if (error) {
      console.error("Error al cerrar sesión:", error.message);
    }

    router.push('/'); // Redirige al login después de cerrar sesión
  };

  return (
    <Button onClick={handleLogout}>
      Cerrar Sesión
    </Button>
  );
};

export default LogoutButton;