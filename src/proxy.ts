import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session cookie on every request.
// Named `proxy` (not `middleware`) per the Next.js 16 file convention.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touches the session so expiring tokens get refreshed before rendering.
  await supabase.auth.getUser();

  // session_id estable para events_tracking, incluso para visitantes anonimos.
  // Se muta tanto `request` como `response` (mismo patron que arriba) para que
  // Route Handlers (no solo paginas) vean la cookie en la misma request.
  if (!request.cookies.get("rutaru_sid")) {
    const sid = crypto.randomUUID();
    request.cookies.set("rutaru_sid", sid);
    response = NextResponse.next({ request });
    response.cookies.set("rutaru_sid", sid, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
