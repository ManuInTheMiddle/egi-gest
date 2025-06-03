import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    console.log(request.nextUrl.pathname);
    console.log(request.nextauth.token);

    
   
    if (
      request.nextUrl.pathname.startsWith("/chegadaMateriaPrima") &&
      request.nextauth.token?.role !== "admin" &&
      request.nextauth.token?.role !== "gestor" &&
      request.nextauth.token?.role !== "rececaomp"
    ) {
      console.log(request.nextauth.token?.role)
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    if (
      request.nextUrl.pathname.startsWith("/receitas") &&
      request.nextauth.token?.role !== "admin" &&
      request.nextauth.token?.role !== "gestor" &&
      request.nextauth.token?.role !== "receitas"
    ) {
      console.log(request.nextauth.token?.role)
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    if (
      request.nextUrl.pathname.startsWith("/producao") &&
      request.nextauth.token?.role !== "admin" &&
      request.nextauth.token?.role !== "gestor" &&
      request.nextauth.token?.role !== "formulacao"
    ) {
      console.log(request.nextauth.token?.role)
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    if (
      request.nextUrl.pathname.startsWith("/produtoAcabado") &&
      request.nextauth.token?.role !== "admin" &&
      request.nextauth.token?.role !== "gestor" &&
      request.nextauth.token?.role !== "producao"
    ) {
      console.log(request.nextauth.token?.role)
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    if (
      request.nextUrl.pathname.startsWith("/expedicao") &&
      request.nextauth.token?.role !== "admin" &&
      request.nextauth.token?.role !== "gestor" &&
      request.nextauth.token?.role !== "expedicao"
    ) {
      console.log(request.nextauth.token?.role)
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    if (
      request.nextUrl.pathname.startsWith("/opcoes") &&
      request.nextauth.token?.role !== "admin" &&
      request.nextauth.token?.role !== "gestor"
  
    ) {
      console.log(request.nextauth.token?.role)
      return NextResponse.rewrite(new URL("/denied", request.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/chegadaMateriaPrima",
    "/receitas",
    "/ordemFabrico",
    "/producao",
    "/producaoAcabado",
    "/expedicao",
    "/maisPrafrente",
    "/opcoes",
    "/denied"
  ],
};
