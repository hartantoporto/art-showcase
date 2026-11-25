import AuthForm from '@/components/AuthForm';
import { Suspense } from 'react';

export const metadata = { title: 'Join the community' };

export default function Register() {
  return (
    <main className="auth-shell">
      <div className="auth-art">
        <div className="relative text-center">
          <div className="hero-sphere mx-auto mb-12" />
          <h2 className="serif text-4xl">Your creativity belongs here.</h2>
          <p className="text-white/65 text-sm mt-4">
            Your art. Your country. Your story.
          </p>
        </div>
      </div>
      <div className="auth-form">
        <Suspense>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </main>
  );
}
