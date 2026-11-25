import AuthForm from '@/components/AuthForm';
import { Suspense } from 'react';

export const metadata = { title: 'Sign in' };

export default function Login() {
  return (
    <main className="auth-shell">
      <div className="auth-art">
        <div className="relative text-center">
          <div className="hero-sphere mx-auto mb-12" />
          <h2 className="serif text-4xl">The world needs your art.</h2>
          <p className="text-white/65 text-sm mt-4">
            Every great creation begins with a spark.
          </p>
        </div>
      </div>
      <div className="auth-form">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </main>
  );
}
