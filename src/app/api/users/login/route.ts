import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body: unknown = await request.json();
        if (!body || typeof body !== "object") {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const values = body as Record<string, unknown>;
        const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
        const password = typeof values.password === "string" ? values.password : "";
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        await connect();
        const user = await User.findOne({ email }).select("+password");
        const validPassword = user ? await bcryptjs.compare(password, user.password) : false;
        if (!user || !validPassword) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }
        if (!user.isVerified) {
            return NextResponse.json(
                {
                    error: "Verify your email before signing in",
                    code: "EMAIL_NOT_VERIFIED",
                },
                { status: 403 }
            );
        }

        const secret = process.env.TOKEN_SECRET;
        if (!secret) throw new Error("TOKEN_SECRET is not configured");

        const token = jwt.sign({ id: user._id.toString() }, secret, { expiresIn: "1d" });
        const response = NextResponse.json({ message: "Login successful", success: true });
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });
        return response;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to sign in";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
