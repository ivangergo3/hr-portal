import { createClientServer } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/database.types";

type SessionResponse = ApiResponse<{
  user: null;
  session: null;
}>;

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (!code) {
      console.error("[Auth Callback] No code provided");
      return NextResponse.redirect(
        new URL("/error?code=no_auth_code", request.url),
      );
    }

    const supabase = await createClientServer();
    try {
      const { error } = (await supabase.auth.exchangeCodeForSession(
        code,
      )) as SessionResponse;

      if (error) {
        console.error(
          "[Auth Callback] Session exchange failed:",
          error.message,
        );
        return NextResponse.redirect(
          new URL(
            `/error?code=auth_failed&message=${error.message}`,
            request.url,
          ),
        );
      }

      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
      console.error("[Auth Callback] Session error:", error);
      return NextResponse.redirect(
        new URL("/error?code=auth_error", request.url),
      );
    }
  } catch (error) {
    console.error("[Auth Callback] Critical error:", error);
    return NextResponse.redirect(new URL("/error?code=critical", request.url));
  }
}
