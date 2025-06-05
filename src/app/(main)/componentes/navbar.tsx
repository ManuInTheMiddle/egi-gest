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
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const Navbar = () => {
  const [user, setUser] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const loginUtilizadorSAP = useLoginSAP();

  useEffect(() => {
    const verificarSession = async () => {
      try {
        const session = await getSession();
        console.log(session);
        setUser(session?.user.name ?? "");
        setUserRole(session?.user.role ?? "");
      } catch (error) {
        console.log(`Erro ao obter sessão: ${error}::`);
      }
    };

    const iniciarSessaoSAP = async () => {
      try {
        await loginUtilizadorSAP.mutate();
        console.log(loginUtilizadorSAP.data);
      } catch (error) {
        console.log(`Erro ao fazer login na sessão SAP: ${error}::`);
      }
    };

    verificarSession();

    const timeout1 = setTimeout(() => {
      iniciarSessaoSAP();
    }, 1500);

    return () => clearTimeout(timeout1);
  }, []);

  return (
    <div>
      <nav className="bg-slate-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          {/* Logo - Fixed link */}
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img
              src="assets/images/logo_JPM_semfundo_.png"
              className="h-8"
              alt="JPM Logo"
            />
            <img
              src="assets/images/Egiquimica-Logotipo.png"
              className="h-10 bg-gradient-to-r from-white to-white"
              alt="Egiquimica Logo"
            />
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {/* Home button */}
            <Link href="/" className="text-white">
              <TooltipCustomizado textoDoTooltip="Página Principal">
                <LayoutGrid color="white" />
              </TooltipCustomizado>
            </Link>

            {/* Admin-only User Management */}
            {userRole === "admin" && (
              <Link href="/users" className="text-white">
                <TooltipCustomizado textoDoTooltip="Gestão de Utilizadores">
                  <Users color="white" />
                </TooltipCustomizado>
              </Link>
            )}

            {/* User Menu */}
            <div className="flex flex-row items-center">
              {loginUtilizadorSAP.isPending ? (
                <Grid
                  visible={true}
                  height="32"
                  width="32"
                  color="#84cc27"
                  ariaLabel="grid-loading"
                  radius="12.5"
                  wrapperStyle={{}}
                  wrapperClass="grid-wrapper"
                />
              ) : (
                <div className="flex flex-row items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <TooltipCustomizado textoDoTooltip="Menu do Utilizador">
                        <User color="white" />
                      </TooltipCustomizado>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>
                        {user}
                        <div className="text-xs text-gray-500 capitalize">
                          {userRole}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Admin-only menu items */}
                      {userRole === "admin" && (
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

                      <DropdownMenuItem
                        onClick={() => {
                          signOut({
                            callbackUrl: "/login",
                            redirect: true,
                          });
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Terminar Sessão
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <p className="text-white ml-2">{`${user}`}</p>
                </div>
              )}
            </div>

            {/* Settings - Fixed link */}
            <Link href="/opcoes">
              <TooltipCustomizado textoDoTooltip="Opções">
                <Settings color="white" />
              </TooltipCustomizado>
            </Link>
          </div>
        </div>
      </nav>
      <div className="bg-lime-500 h-1" />
    </div>
  );
};

export default Navbar;

/*
"use client"
import { Settings, User, LayoutGrid, LogOut } from "lucide-react";
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
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";



const Navbar = () => {
  const [user, setUser] = useState<string>("");
  const loginUtilizadorSAP = useLoginSAP();

  useEffect(() => {

    const verificarSession = async () => {
      try {
        const session = await getSession();
        console.log(session);
        setUser(session?.user.name ?? "");
      } catch (error) {
        console.log(`Erro ao obter sessão: ${error}::`);
      }
    };
    
    const obterCookies = async () =>{
      const response = await fetch('/api/cookies');
      const data = await response.json();
      console.log('Cookies:',data);
    }
    
    const iniciarSessaoSAP = async () => {
      try {
        await loginUtilizadorSAP.mutate();
        console.log(loginUtilizadorSAP.data);
      } catch (error) {
        console.log(`Erro ao fazer login na sessão SAP: ${error}::`);
      }
    };
    
    
    verificarSession()
    
    const timeout1 = setTimeout(() => {
      iniciarSessaoSAP()
    }, 1500);
    
    //obterCookies()
    
    return ()=> clearTimeout(timeout1)
    
  }, []);

  return (
    <div>
      <nav className="bg-slate-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img
              src="assets/images/logo_JPM_semfundo_.png"
              className="h-8"
              alt="JPM Logo"
            />
            <img
              src="assets/images/Egiquimica-Logotipo.png"
              className="h-10 bg-gradient-to-r from-white to-white "
              alt="Egiquimica Logo"
            />
          </Link>
          {
            <Link href="/" className="text-white">
              <TooltipCustomizado textoDoTooltip="Página Principal">
                <LayoutGrid color="white" />
              </TooltipCustomizado>
            </Link>
          }
          <Link
            href=""
            onClick={async () => {
              
              console.log("Login");
              await estadoLoginSAP.mutate();

              if (estadoLoginSAP.isSuccess) {
                console.log("Logado");
              }
              if (estadoLoginSAP.isError) {
                console.log("error while login");
              }
                
            }}
          >
            {loginUtilizadorSAP.isPending ? (
              <Grid
                visible={true}
                height="32"
                width="32"
                color="#84cc27"
                ariaLabel="grid-loading"
                radius="12.5"
                wrapperStyle={{}}
                wrapperClass="grid-wrapper"
              />
            ) : (
              <div className="flex flex-row items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <TooltipCustomizado textoDoTooltip="Login">
                      <User color="white" />
                    </TooltipCustomizado>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Utilizador</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        signOut();
                      }}
                    >
                      <LogOut className="mr-1" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-white">{`=> ${user}`}</p>
              </div>
            )}
          </Link>
          <Link href="opcoes">
            <TooltipCustomizado textoDoTooltip="Opções">
              <Settings color="white" />
            </TooltipCustomizado>
          </Link>
        </div>
      </nav>
      <div className="bg-lime-500 h-1" />
    </div>
  );
};

export default Navbar;
*/
