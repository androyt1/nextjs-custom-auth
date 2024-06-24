import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import * as jose from "jose";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new jose.SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("1h")
            .sign(secret);

        const response = NextResponse.json({ message: "Login successful" });
        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600, // 1 hour
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "Error logging in" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
