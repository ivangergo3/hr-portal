import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  try {
    // List of public routes that don't require authentication
    const publicRoutes = [
      "/login",
      "/auth/callback",
      "/error",
      "/errors",
      "/test-login",
      "/auth",
      "/api/auth",
    ];

    // Check if the current route is public
    const isPublicRoute = publicRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    // Initialize response
    let supabaseResponse = NextResponse.next({
      request,
    });

    // Create Supabase client
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
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      },
    );

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    // This is needed to refresh the session cookie
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // If there's an auth error
    if (userError) {
      console.error("[Middleware] Session error:", userError.message);

      // If we're already on an error or login page, don't redirect
      if (
        request.nextUrl.pathname.startsWith("/error") ||
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/auth/callback")
      ) {
        return NextResponse.next();
      }

      // If the user is in an authenticated route, redirect to the authenticated error page
      if (
        request.nextUrl.pathname.startsWith("/(authenticated)") ||
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/profile") ||
        request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/time-off") ||
        request.nextUrl.pathname.startsWith("/timesheets")
      ) {
        return NextResponse.redirect(new URL("/errors?code=auth", request.url));
      }

      // Otherwise redirect to the public error page
      return NextResponse.redirect(new URL("/error?code=auth", request.url));
    }

    // Special handling for OAuth callback
    if (request.nextUrl.pathname.startsWith("/auth/callback")) {
      // Let the callback route handle the flow
      return supabaseResponse;
    }

    // If no user and not on a public route, redirect to login
    if (!user && !isPublicRoute) {
      // Store the original URL to redirect back after login
      const url = request.nextUrl.clone();
      const returnTo = encodeURIComponent(
        request.nextUrl.pathname + request.nextUrl.search,
      );
      url.pathname = "/login";

      // Add returnTo parameter if we're not already on the login page
      if (!request.nextUrl.pathname.startsWith("/login")) {
        url.searchParams.set("returnTo", returnTo);
      }

      return NextResponse.redirect(url);
    }

    // If user exists and trying to access login, redirect to dashboard
    if (
      user &&
      request.nextUrl.pathname.startsWith("/login")
    ) {
      // Check if there's a returnTo parameter
      const returnTo = request.nextUrl.searchParams.get("returnTo");
      if (returnTo) {
        try {
          const decodedReturnTo = decodeURIComponent(returnTo);
          return NextResponse.redirect(new URL(decodedReturnTo, request.url));
        } catch (e) {
          console.error("[Middleware] Invalid returnTo URL:", e);
        }
      }

      // Default redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[Middleware] Critical error:", error);
    // Make sure we're not creating a redirect loop
    if (request.nextUrl.pathname.startsWith("/error")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/error?code=critical", request.url));
  }
}
