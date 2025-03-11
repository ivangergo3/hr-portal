export default function LoginHeader() {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <h2
        className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900"
        data-testid="login-header-title"
      >
        HR Portal
      </h2>
      <p
        className="mt-2 text-center text-sm text-slate-600"
        data-testid="login-header-subtitle"
      >
        Sign in to your account
      </p>
    </div>
  );
}
