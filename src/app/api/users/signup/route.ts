import { connect } from "@/dbConfig/dbConfig";
import { sendEmail } from "@/helpers/mailer";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
    try {
        const body: unknown = await request.json();
        if (!body || typeof body !== "object") {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const values = body as Record<string, unknown>;
        const username = typeof values.username === "string" ? values.username.trim() : "";
        const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
        const password = typeof values.password === "string" ? values.password : "";

        if (username.length < 2 || username.length > 40) {
            return NextResponse.json({ error: "Username must be between 2 and 40 characters" }, { status: 400 });
        }
        if (!emailPattern.test(email)) {
            return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
        }
        if (password.length < 8 || password.length > 128) {
            return NextResponse.json({ error: "Password must be between 8 and 128 characters" }, { status: 400 });
        }

        await connect();
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return NextResponse.json({ error: "An account with those details already exists" }, { status: 409 });
        }

        const savedUser = await User.create({
            username,
            email,
            password: await bcryptjs.hash(password, 12),
        });

        try {
            await sendEmail({ email, emailType: "VERIFY", userId: savedUser._id });
        } catch (error) {
            await User.deleteOne({ _id: savedUser._id });
            throw error;
        }

        return NextResponse.json(
            {
                message: "Account created. Check your email to verify it.",
                success: true,
                user: { id: savedUser._id, username: savedUser.username, email: savedUser.email },
            },
            { status: 201 }
        );
    } catch {
        return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
    }
}
