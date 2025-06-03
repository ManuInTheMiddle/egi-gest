"use client";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useEffect } from "react";
import { useLoginSAP } from "@/Services/UserSap/loginSap";


export default function LoginPage() {
  
  const [usernameField,setUsernameField] = useState('');
  const [isEmpty,setIsEmpty] = useState(true);

  useEffect(()=>{

    const timer = setTimeout(()=>{
      setIsEmpty(usernameField.trim() ==='')
    },300)

    return ()=> clearTimeout(timer)

  },[usernameField])

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
          </div>

          <div className="mt-10">
            <div>
              <form
                className="space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();

                  const target = e.target as typeof e.target & {
                    username:{value:string},
                    password:{value:string}
                  }

                  const username = target.username.value;
                  const password = target.password.value;
                  const result = await signIn("credentials", {
                    redirect: false,
                    username,
                    password,
                  });

                  if (result?.error) {
                    console.error("Login failed");
                  } else {
                    console.log("Login Succesful!");
                    const session = await getSession();

                    //console.log(session)

                    if (session) {
                      if (session.user.role === "admin") {
                        window.location.href = "/";
                      }
                      if (session.user.role === "gestor") {
                        window.location.href = "/";
                      }
                      if (session.user.role === "rececaomp") {
                        window.location.href = "/chegadaMateriaPrima";
                      }
                      if (session.user.role === "receitas") {
                        window.location.href = "/receitas";
                      }
                      if (session.user.role === "formulacao") {
                        window.location.href = "/producao";
                      }
                      if (session.user.role === "producao") {
                        window.location.href = "/producaoAcabado";
                      }
                      if (session.user.role === "expedicao") {
                        window.location.href = "/expedicao";
                      }else{
                        console.log("utilizador NA")
                      }
                    }
                  }
                }}
              >
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
                      onChange={(e)=>(setUsernameField(e.target.value))}
                      required
                      autoComplete="username"
                      className="block w-full text-center rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder={(isEmpty && "Preencher campo utilizador") || ""}
                      disabled = {isEmpty}
                      required
                      autoComplete="current-password"
                      className="block w-full text-center rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isEmpty}
                    className={!isEmpty&&"flex w-full justify-center rounded-md bg-lime-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-lime-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"||"flex w-full justify-center rounded-md bg-lime-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm"}
                  >
                    Iniciar
                  </button>
                </div>
              </form>
            </div>
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
