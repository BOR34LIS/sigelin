// app/usuarios/[id]/page.tsx

import UsuarioEditForm from "@/components/usuarios/UsuarioEditForm"; 

// Next.js pasa los parámetros dinámicos (id) en el objeto 'params'
interface Props {
  params: {
    id: string; // El ID (UUID) del usuario a editar
  }
}

export default function EditUserPage({ params }: Props) {
  return (
    // Pasamos el ID del usuario al componente del formulario
    <UsuarioEditForm userId={params.id} />
  );
}