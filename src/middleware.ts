// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define route access control
const ROUTE_ACCESS: Record<string, string[]> = {
  "/": ["admin", "gestor"],
  "/chegadaMateriaPrima": ["admin", "gestor", "rececaomp"],
  "/receitas": ["admin", "gestor", "receitas"],
  "/producao": ["admin", "gestor", "formulacao"],
  "/produtoAcabado": ["admin", "gestor", "producao"],
  "/expedicao": ["admin", "gestor", "expedicao"],
  "/opcoes": ["admin", "gestor"],
  "/users": ["admin"],
  "/configuracoes": ["admin"],
  "/relatorios": ["admin", "gestor"],
};

// Define default landing pages
const DEFAULT_PAGES: Record<string, string> = {
  admin: "/",
  gestor: "/producao",
  rececaomp: "/chegadaMateriaPrima",
  receitas: "/receitas",
  formulacao: "/producao",
  producao: "/produtoAcabado",
  expedicao: "/expedicao",
};

// Public routes
const PUBLIC_ROUTES = ["/login", "/api/auth", "/denied"];

function hasAccess(userRole: string, pathname: string): boolean {
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return true;
  }

  if (userRole === "admin") {
    return true;
  }

  for (const [route, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole);
    }
  }

  return true;
}

function getDefaultPage(userRole: string): string {
  return DEFAULT_PAGES[userRole] || "/producao";
}

export default withAuth(
  async function middleware(request) {
    const { pathname } = request.nextUrl;

    if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
      return NextResponse.next();
    }

    const token = request.nextauth.token;
    const userRole = token?.role as string;
    const username = token?.name || token?.username || "unknown";

    console.log(`Middleware: ${username} (${userRole}) accessing ${pathname}`);

    // Skip for API routes and static files
    if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // Skip middleware for NextAuth routes completely
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // Handle root path - DON'T redirect admin and gestor
    if (pathname === "/") {
      if (userRole === "admin" || userRole === "gestor") {
        // Allow admin and gestor to access home page
        console.log(`${userRole} accessing home page - allowing access`);
        return NextResponse.next();
      } else {
        // Redirect other users to their default page
        const defaultPage = getDefaultPage(userRole);
        console.log(`Redirecting ${userRole} from / to ${defaultPage}`);
        return NextResponse.redirect(new URL(defaultPage, request.url));
      }
    }

    // Check access for other paths
    const allowed = hasAccess(userRole, pathname);

    if (!allowed) {
      console.log(`Access denied for ${username} to ${pathname}`);
      return NextResponse.rewrite(new URL("/denied", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        //caso esteja no modo de mock
        if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
          return true;
        }

        // Allow all requests to login page
        if (req.nextUrl.pathname === "/login") {
          return true;
        }
        // For other routes, require token
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|assets).*)"],
};
