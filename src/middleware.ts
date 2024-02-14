import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    console.log(request.nextUrl.pathname);
    console.log(request.nextauth.token);

    //caso o url seja "/ordemFabrico" e o utilizador NAO seja admin não tera permissoes para prosseguir
    /*
    if (
      request.nextUrl.pathname.match("/") &&
      request.nextauth.token?.role !== "admin"
    ) {
      return NextResponse.rewrite(new URL("/denied", request.url));
    }
    */
    if (
      request.nextUrl.pathname.startsWith("/dashboard") &&
      request.nextauth.token?.role !== "admin" &&
      request.nextauth.token?.role !== "dashboard"
    ) {
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    if (
      request.nextUrl.pathname.startsWith("/ordemFabrico") &&
      request.nextauth.token?.role !== "admin" &&
      request.nextauth.token?.role !== "ordensfabrico"
    ) {
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    if (
      request.nextUrl.pathname.startsWith("/producao") &&
      request.nextauth.token?.role !== "admin" &&
      request.nextauth.token?.role !== "producao"
    ) {
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    if (
      request.nextUrl.pathname.startsWith("/opcoes") &&
      request.nextauth.token?.role !== "admin"
    ) {
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
  matcher: ["/", "/dashboard", "/ordemFabrico", "/producao", "/opcoes"],
};
