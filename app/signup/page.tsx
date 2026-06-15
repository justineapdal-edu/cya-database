import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  return (
    <AuthPageShell>
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </AuthPageShell>
  );
}
