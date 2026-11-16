import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "./config";


const PUBLIC_PATHS = [
  "/login",
  "/recuperar-senha",
  "/redefinir-senha",
  "/auth/callback",
  "/api/cron/gerar",
  "/api/cron/photos",
  "/api/photos",
  "/api/health"
];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  let response = NextResponse.next({ request });
  let authenticated = false;

  if (hasSupabase) {
    const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
        }
      }
    });
    const {
      data: { user }
    } = await supabase.auth.getUser();
    authenticated = Boolean(user);
  }

  if (!authenticated && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return sessionRedirect(url, response);
  }

  if (authenticated && (pathname === "/login" || pathname === "/recuperar-senha")) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    url.search = "";
    return sessionRedirect(url, response);
  }

  return withSecurityHeaders(response);
}

function sessionRedirect(url: URL, response: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
  return withSecurityHeaders(redirect);
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  // Authenticated HTML and session refresh responses must never enter a shared CDN cache.
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), geolocation=(), microphone=()");
  return response;
}

