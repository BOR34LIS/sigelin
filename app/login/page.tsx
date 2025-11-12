import LoginForm from "@/components/login/LoginForm";
import { Suspense } from "react";
import './loginpage.css';
function Loading() {
  return <div>Cargando...</div>;
}

export default function LoginPage() {
  return (
    <main className="login-page-container">
      <Suspense fallback={<Loading />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}