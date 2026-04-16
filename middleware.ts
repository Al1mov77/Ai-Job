import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// All route protection is handled client-side via localStorage + withProtectedRoute HOC.
// Middleware just passes requests through.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/candidate/:path*",
    "/organization/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
