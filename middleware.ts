import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jose.jwtVerify(token, secret);
        return NextResponse.next();
    } catch (error) {
        // If token verification fails, clear the token and redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.set({
            name: "token",
            value: "",
            expires: new Date(0),
            path: "/",
        });
        return response;
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
