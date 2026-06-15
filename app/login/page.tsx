import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <AuthPageShell>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </AuthPageShell>
  );
}
