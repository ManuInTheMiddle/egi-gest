import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();

  const cookieList = allCookies.map((cookie) => ({
    name: cookie.name,
    value: cookie.value,
  }));

  return new Response(JSON.stringify({ cookies: cookieList }), {
    headers: { "Content-Type": "application/json" },
  });
}
