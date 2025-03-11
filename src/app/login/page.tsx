import LoginWrapper from '@/components/auth/login/LoginWrapper';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <LoginWrapper />
    </ErrorBoundary>
  );
}
