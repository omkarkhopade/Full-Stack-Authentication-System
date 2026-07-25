import { connect } from "@/dbConfig/dbConfig";
import { tokenDigest } from "@/helpers/mailer";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();
        if (typeof token !== "string" || token.length !== 64) {
            return NextResponse.json({ error: "Invalid verification link" }, { status: 400 });
        }

        await connect();
        const user = await User.findOne({
            verifyToken: tokenDigest(token),
            verifyTokenExpiry: { $gt: new Date() },
        }).select("+verifyToken +verifyTokenExpiry");

        if (!user) {
            return NextResponse.json({ error: "This verification link is invalid or expired" }, { status: 400 });
        }

        user.isVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;
        await user.save();

        return NextResponse.json({ message: "Email verified successfully", success: true });
    } catch {
        return NextResponse.json({ error: "Unable to verify email" }, { status: 500 });
    }
}
