import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPaths = new Set([
    "/login",
    "/signup",
    "/verifyemail",
    "/forgotpassword",
    "/resetpassword",
]);

const authPaths = new Set(["/login", "/signup"]);

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const hasSession = Boolean(request.cookies.get("token")?.value);

    if (authPaths.has(path) && hasSession) {
        return NextResponse.redirect(new URL("/profile", request.url));
    }

    if (!publicPaths.has(path) && !hasSession) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/profile/:path*",
        "/admin/:path*",
        "/login",
        "/signup",
        "/verifyemail",
        "/forgotpassword",
        "/resetpassword",
    ],
};
