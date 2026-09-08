"use client";
import { Settings, User, LayoutGrid, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { useLoginSAP } from "@/Services/UserSap/loginSap";
import { Grid } from "react-loader-spinner";
import { TooltipCustomizado } from "../../../components/tooltipCustomizado";
import { getSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";

// Quick cookie utility function
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

// Types
interface User {
  name: string;
  role: "admin" | "user" | "";
}

interface NavbarState {
  user: User;
  loading: boolean;
  error: string | null;
  sapLoginInProgress: boolean;
}

// Constants
const LOGO_PATHS = {
  jpm: "/assets/images/logo_JPM_semfundo_.png",
  egiquimica: "/assets/images/Egiquimica-Logotipo.png",
} as const;

const SAP_LOGIN_DELAY = 1500;

const Navbar = () => {
  const [state, setState] = useState<NavbarState>({
    user: { name: "", role: "" },
    loading: true,
    error: null,
    sapLoginInProgress: false,
  });

  const loginUtilizadorSAP = useLoginSAP();

  // Memoized state updaters
  const updateUser = useCallback((name: string, role: string) => {
    setState((prev) => ({
      ...prev,
      user: { name, role: role as "admin" | "user" | "" },
      loading: false,
      error: null,
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      loading: false,
      error,
      sapLoginInProgress: false,
    }));
  }, []);

  const setSapLoginProgress = useCallback((inProgress: boolean) => {
    setState((prev) => ({ ...prev, sapLoginInProgress: inProgress }));
  }, []);

  // Session verification
  const verificarSession = useCallback(async () => {
    try {
      const session = await getSession();
      console.log("Session obtained:", session);

      if (session?.user) {
        updateUser(session.user.name ?? "", session.user.role ?? "");
      } else {
        setError("Sessão não encontrada");
      }
    } catch (error) {
      console.error("Erro ao obter sessão:", error);
      setError("Erro ao verificar sessão");
    }
  }, [updateUser, setError]);

  // SAP login with quick cookie check
  const iniciarSessaoSAP = useCallback(async () => {
    if (state.sapLoginInProgress) return; // Prevent multiple calls

    // 🔥 QUICK IMPLEMENTATION: Check for SAP cookie before making API call
    const b1Session = getCookie("B1SESSION");
    if (b1Session && b1Session.length > 10) {
      console.log("Valid SAP session exists (B1SESSION found), skipping login");
      return; // Skip SAP login
    }

    try {
      console.log("No SAP session found, initiating login...");
      setSapLoginProgress(true);
      await loginUtilizadorSAP.mutate();
      console.log("SAP login successful:", loginUtilizadorSAP.data);
    } catch (error) {
      console.error("Erro ao fazer login na sessão SAP:", error);
      // Don't set error state for SAP login failures as it's not critical
    } finally {
      setSapLoginProgress(false);
    }
  }, [loginUtilizadorSAP, state.sapLoginInProgress, setSapLoginProgress]);

  // Handle logout with cookie cleanup
  const handleLogout = useCallback(() => {
    // 🔥 Clear SAP cookie on logout
    if (typeof document !== "undefined") {
      document.cookie =
        "B1SESSION=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }

    signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  }, []);

  // Main effect
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeComponent = async () => {
      if (!isMounted) return;

      // First verify session
      await verificarSession();

      // Then start SAP login after delay (only if component is still mounted)
      timeoutId = setTimeout(() => {
        if (isMounted && !state.sapLoginInProgress) {
          iniciarSessaoSAP(); // This now includes the cookie check
        }
      }, SAP_LOGIN_DELAY);
    };

    initializeComponent();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Empty dependency array is correct here

  const isLoading =
    state.loading || loginUtilizadorSAP.isPending || state.sapLoginInProgress;

  return (
    <div>
      <nav className="bg-slate-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
            aria-label="Página Principal"
          >
            <img
              src={LOGO_PATHS.jpm}
              className="h-8"
              alt="JPM Logo"
              loading="lazy"
            />
            <img
              src={LOGO_PATHS.egiquimica}
              className="h-10 bg-gradient-to-r from-white to-white"
              alt="Egiquimica Logo"
              loading="lazy"
            />
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {/* Home button */}
            <Link
              href="/"
              className="text-white hover:text-gray-200 transition-colors"
            >
              <TooltipCustomizado textoDoTooltip="Página Principal">
                <LayoutGrid color="white" />
              </TooltipCustomizado>
            </Link>

            {/* Admin-only User Management */}
            {state.user.role === "admin" && (
              <Link
                href="/users"
                className="text-white hover:text-gray-200 transition-colors"
              >
                <TooltipCustomizado textoDoTooltip="Gestão de Utilizadores">
                  <Users color="white" />
                </TooltipCustomizado>
              </Link>
            )}

            {/* User Menu */}
            <div className="flex flex-row items-center">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Grid
                    visible={true}
                    height="32"
                    width="32"
                    color="#84cc27"
                    ariaLabel="Carregando dados do utilizador"
                    radius="12.5"
                    wrapperStyle={{}}
                    wrapperClass="grid-wrapper"
                  />
                  {state.sapLoginInProgress && (
                    <span className="text-white text-xs">
                      Conectando SAP...
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-row items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="hover:bg-slate-700 p-1 rounded transition-colors">
                      <TooltipCustomizado textoDoTooltip="Menu do Utilizador">
                        <User color="white" />
                      </TooltipCustomizado>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>
                        {state.user.name || "Utilizador"}
                        <div className="text-xs text-gray-500 capitalize">
                          {state.user.role || "user"}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Admin-only menu items */}
                      {state.user.role === "admin" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/users" className="cursor-pointer">
                              <Users className="mr-2 h-4 w-4" />
                              Gestão de Utilizadores
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Terminar Sessão
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <p className="text-white ml-2 text-sm">
                    {state.user.name || "Utilizador"}
                  </p>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link
              href="/opcoes"
              className="text-white hover:text-gray-200 transition-colors"
            >
              <TooltipCustomizado textoDoTooltip="Opções">
                <Settings color="white" />
              </TooltipCustomizado>
            </Link>
          </div>
        </div>
      </nav>
      <div className="bg-lime-500 h-1" />

      {/* Error display */}
      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">
          Erro: {state.error}
        </div>
      )}
    </div>
  );
};

export default Navbar;
