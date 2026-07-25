import { connect } from "@/dbConfig/dbConfig";
import { tokenDigest } from "@/helpers/mailer";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();
        if (typeof token !== "string" || token.length !== 64) {
            return NextResponse.json({ error: "Invalid reset link" }, { status: 400 });
        }
        if (typeof password !== "string" || password.length < 8 || password.length > 128) {
            return NextResponse.json({ error: "Password must be between 8 and 128 characters" }, { status: 400 });
        }

        await connect();
        const user = await User.findOne({
            forgotPasswordToken: tokenDigest(token),
            forgotPasswordTokenExpiry: { $gt: new Date() },
        }).select("+password +forgotPasswordToken +forgotPasswordTokenExpiry");

        if (!user) {
            return NextResponse.json({ error: "This password reset link is invalid or expired" }, { status: 400 });
        }

        user.password = await bcryptjs.hash(password, 12);
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;
        await user.save();

        return NextResponse.json({ message: "Password reset successfully", success: true });
    } catch {
        return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
    }
}
