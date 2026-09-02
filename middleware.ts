import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/register", "/verify-email"];
const AUTH_ONLY_PATHS = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("expense_tracker_session")?.value;
  let isValid = false;

  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!isValid && !isPublic) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (isValid && AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
