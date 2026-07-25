import { connect } from "@/dbConfig/dbConfig";
import { sendEmail } from "@/helpers/mailer";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const genericMessage = "If an unverified account exists for that email, a new verification link has been sent.";

export async function POST(request: NextRequest) {
    try {
        const body: unknown = await request.json();
        const email = body && typeof body === "object" && typeof (body as Record<string, unknown>).email === "string"
            ? ((body as Record<string, unknown>).email as string).trim().toLowerCase()
            : "";

        if (!emailPattern.test(email)) {
            return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
        }

        await connect();
        const user = await User.findOne({ email });

        if (user && !user.isVerified) {
            try {
                const delivery = await sendEmail({
                    email: user.email,
                    emailType: "VERIFY",
                    userId: user._id,
                });
                if (process.env.NODE_ENV !== "production") {
                    console.info("Verification email accepted by SMTP:", {
                        accepted: delivery.accepted,
                        rejected: delivery.rejected,
                        messageId: delivery.messageId,
                    });
                }
            } catch (error: unknown) {
                if (process.env.NODE_ENV !== "production") {
                    const message = error instanceof Error ? error.message : "Unknown SMTP error";
                    console.error("Verification email delivery failed:", message);
                    return NextResponse.json(
                        { error: `Verification email delivery failed: ${message}` },
                        { status: 502 }
                    );
                }
                // Production responses stay indistinguishable to prevent account enumeration.
            }
        }

        return NextResponse.json({ message: genericMessage, success: true });
    } catch {
        return NextResponse.json({ error: "Unable to process verification request" }, { status: 500 });
    }
}
