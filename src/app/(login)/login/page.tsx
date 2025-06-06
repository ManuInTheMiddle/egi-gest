// app/login/page.tsx - Fixed with Suspense boundary
"use client";
import { Suspense } from "react";
import { getSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Loading component for Suspense fallback
function LoginLoading() {
  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <img
              alt="egiquimica"
              src="assets/images/Egiquimica-Logotipo.png"
              className="h-10 w-auto"
            />
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              A carregar...
            </h2>
          </div>
          <div className="mt-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
          </div>
        </div>
      </div>
      <div className="relative w-0 flex-1 lg:block h-full">
        <img
          alt=""
          src="assets/webp/factory2.webp"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

// Main login form component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Now properly wrapped in Suspense
  const [usernameField, setUsernameField] = useState('');
  const [passwordField, setPasswordField] = useState('');
  const [isEmpty, setIsEmpty] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get callback URL from search params
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEmpty(usernameField.trim() === '');
    }, 300);

    return () => clearTimeout(timer);
  }, [usernameField]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (usernameField || passwordField)) {
      setError('');
    }
  }, [usernameField, passwordField, error]);

  const getRoleRedirectUrl = (role: string): string => {
    const roleRoutes: Record<string, string> = {
      admin: "/",
      gestor: "/producao", 
      rececaomp: "/chegadaMateriaPrima",
      receitas: "/receitas",
      formulacao: "/producao",
      producao: "/produtoAcabado",
      expedicao: "/expedicao",
    };
    return roleRoutes[role] || "/producao";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username?.trim() || !password) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username: username.trim(),
        password,
      });

      if (result?.error) {
        console.error("Login failed:", result.error);
        setError('Credenciais inválidas. Verifique o utilizador e palavra-passe.');
      } else if (result?.ok) {
        console.log("Login successful!");
        
        const session = await getSession();
        
        if (session?.user) {
          const redirectUrl = callbackUrl !== '/' 
            ? callbackUrl 
            : getRoleRedirectUrl(session.user.role);
          
          console.log(`Redirecting ${session.user.role} user to: ${redirectUrl}`);
          router.push(redirectUrl);
        } else {
          setError('Erro ao obter informações da sessão');
        }
      } else {
        setError('Erro inesperado durante o login');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <img
              alt="egiquimica"
              src="assets/images/Egiquimica-Logotipo.png"
              className="h-10 w-auto"
            />
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Iniciar Sessão
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Sistema de Gestão de Produção
            </p>
          </div>

          <div className="mt-10">
            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                <span>{error}</span>
              </div>
            )}

            {/* Callback URL Info */}
            {callbackUrl && callbackUrl !== '/' && (
              <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
                <p>Faça login para aceder à página solicitada.</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Utilizador
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={usernameField}
                    onChange={(e) => setUsernameField(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="username"
                    className="block w-full text-center rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Nome de utilizador"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Palavra-passe
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={passwordField}
                    onChange={(e) => setPasswordField(e.target.value)}
                    placeholder={isEmpty ? "Preencher campo utilizador" : "Palavra-passe"}
                    disabled={isEmpty || isLoading}
                    required
                    autoComplete="current-password"
                    className="block w-full text-center rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isEmpty || isLoading}
                  className={`flex w-full justify-center items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm transition-colors ${
                    isEmpty || isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-lime-600 hover:bg-lime-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      A entrar...
                    </>
                  ) : (
                    'Iniciar Sessão'
                  )}
                </button>
              </div>
            </form>

            {/* Development Info */}
            {/*process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-50 rounded-md text-xs text-gray-600">
                <p className="font-medium mb-2">Utilizadores de Teste:</p>
                <div className="space-y-1">
                  <p><strong>Admin:</strong> JPMadmin / JPM_4528</p>
                  <p><strong>Gestor:</strong> Gestor / Gestor_4528</p>
                  <p><strong>Produção:</strong> Producao / Producao_4528</p>
                  <p><strong>Receitas:</strong> Receitas / Receitas_4528</p>
                </div>
              </div>
            )*/}
          </div>
        </div>
      </div>
      
      <div className="relative w-0 flex-1 lg:block h-full">
        <img
          alt=""
          src="assets/webp/factory2.webp"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}