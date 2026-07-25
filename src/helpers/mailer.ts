import User from "@/models/userModel";
import { createHash, randomBytes } from "crypto";
import nodemailer from "nodemailer";

type SendEmailParams = {
    email: string;
    emailType: "VERIFY" | "RESET";
    userId: { toString(): string };
};

const hashToken = (token: string) =>
    createHash("sha256").update(token).digest("hex");

export const tokenDigest = hashToken;

export const sendEmail = async ({ email, emailType, userId }: SendEmailParams) => {
    const token = randomBytes(32).toString("hex");
    const storedToken = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    if (emailType === "VERIFY") {
        await User.findByIdAndUpdate(userId, {
            verifyToken: storedToken,
            verifyTokenExpiry: expiresAt,
        });
    } else {
        await User.findByIdAndUpdate(userId, {
            forgotPasswordToken: storedToken,
            forgotPasswordTokenExpiry: expiresAt,
        });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const vercelHost =
        process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    const appUrl =
        process.env.APP_URL ||
        (vercelHost ? `https://${vercelHost}` : process.env.DOMAIN);

    if (!host || !Number.isInteger(port) || port <= 0 || !user || !pass || !appUrl) {
        throw new Error("Email service is not configured");
    }
    if (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/i.test(appUrl)) {
        throw new Error("APP_URL must use the deployed HTTPS domain in production");
    }

    const route = emailType === "VERIFY" ? "verifyemail" : "resetpassword";
    const action = emailType === "VERIFY" ? "Verify email" : "Reset password";
    const link = `${appUrl.replace(/\/$/, "")}/${route}?token=${encodeURIComponent(token)}`;
    const transport = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    const delivery = await transport.sendMail({
        from: process.env.EMAIL_FROM || "Authly <no-reply@authly.local>",
        to: email,
        subject: `${action} — Authly [${token.slice(0, 6).toUpperCase()}]`,
        text: `${action}: ${link}\n\nThis link expires in one hour.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#172033">
                <h1 style="font-size:24px">${action}</h1>
                <p>Use the secure button below to continue. This link expires in one hour.</p>
                <p style="margin:28px 0">
                    <a href="${link}" style="background:#5b50dc;color:#fff;padding:13px 20px;border-radius:9px;text-decoration:none;font-weight:700">${action}</a>
                </p>
                <p style="font-size:12px;color:#64748b">If you did not request this email, you can safely ignore it.</p>
            </div>
        `,
    });

    console.info("Auth email accepted by SMTP:", {
        type: emailType,
        accepted: delivery.accepted,
        rejected: delivery.rejected,
        messageId: delivery.messageId,
    });

    return delivery;
};
