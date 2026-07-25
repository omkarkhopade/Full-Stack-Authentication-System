import { connect } from "@/dbConfig/dbConfig";
import { sendEmail } from "@/helpers/mailer";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (!normalizedEmail) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await connect();
        const user = await User.findOne({ email: normalizedEmail });

        if (user) {
            try {
                await sendEmail({
                    email: user.email,
                    emailType: "RESET",
                    userId: user._id,
                });
            } catch {
                // Keep the response indistinguishable to prevent account enumeration.
            }
        }

        return NextResponse.json({
            message: "If an account exists for that email, a password reset link has been sent.",
            success: true,
        });
    } catch {
        return NextResponse.json({ error: "Unable to process reset request" }, { status: 500 });
    }
}
