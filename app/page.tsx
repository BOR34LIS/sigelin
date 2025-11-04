// app/page.tsx

import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige automáticamente al usuario a la página de login
  redirect('/login');

  // No se renderiza nada aquí, ya que la redirección ocurre primero.
  // Pero Next.js requiere que el componente devuelva algo, aunque sea nulo.
  return null;
}