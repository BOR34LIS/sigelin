import LoginForm from "@/components/login/LoginForm";
import { Suspense } from "react";

function Loading() {
  return <div>Cargando...</div>;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}