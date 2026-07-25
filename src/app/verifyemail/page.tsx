"use client";

import AuthShell from "@/components/AuthShell";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type VerificationStatus = "idle" | "loading" | "success" | "error";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const [email, setEmail] = useState(() => searchParams.get("email") || "");
    const [status, setStatus] = useState<VerificationStatus>(token ? "loading" : "idle");
    const [message, setMessage] = useState(token ? "Confirming your secure token..." : "");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (!token) return;
        const verify = async () => {
            try {
                await axios.post("/api/users/verifyemail", { token });
                setStatus("success");
                setMessage("Your email address is verified. Your account is ready to use.");
            } catch (error: unknown) {
                setStatus("error");
                setMessage(axios.isAxiosError(error)
                    ? error.response?.data?.error || "This link is invalid or expired."
                    : "Unable to verify this email.");
            }
        };
        void verify();
    }, [token]);

    const resendVerification = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setSending(true);
            const response = await axios.post("/api/users/resendverification", { email });
            setSent(true);
            toast.success(response.data.message);
        } catch (error: unknown) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.error || "Unable to send verification email"
                : "Unable to send verification email";
            toast.error(errorMessage);
        } finally {
            setSending(false);
        }
    };

    if (status === "success") {
        return (
            <AuthShell
                eyebrow="Email confirmation"
                title="You’re verified"
                subtitle="Your email address is confirmed and your account is ready."
                footer={<Link href="/login">Return to sign in</Link>}
            >
                <div className="status-card">
                    <span className="status-icon">✓</span>
                    <h2>Verification complete</h2>
                    <p>{message}</p>
                </div>
                <Link className="primary-button" href="/login">Continue to login</Link>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            eyebrow="Email confirmation"
            title={status === "loading" ? "Verifying your email" : status === "error" ? "Request a fresh link" : "Verify your email"}
            subtitle={status === "loading"
                ? "We’re validating your secure, single-use verification token."
                : "Enter your account email and we’ll send a new one-hour verification link."}
            footer={<Link href="/login">Return to sign in</Link>}
        >
            {status === "loading" ? (
                <div className="status-card">
                    <span className="status-icon"><span className="spinner" /></span>
                    <h2>Just a moment</h2>
                    <p>{message}</p>
                </div>
            ) : (
                <>
                    {status === "error" && (
                        <div className="verification-notice">
                            <div><strong>Link unavailable</strong><span>{message}</span></div>
                        </div>
                    )}
                    {sent ? (
                        <div className="status-card">
                            <span className="status-icon">✉</span>
                            <h2>Check your inbox</h2>
                            <p>If an unverified account exists for <strong>{email}</strong>, a new link has been sent.</p>
                        </div>
                    ) : (
                        <form className="auth-form" onSubmit={resendVerification}>
                            <div className="field">
                                <label htmlFor="verificationEmail">Email address</label>
                                <input
                                    className="input"
                                    id="verificationEmail"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <p className="helper">Sending a new email invalidates the previous verification link.</p>
                            <button className="primary-button" disabled={sending || !email.trim()} type="submit">
                                {sending && <span className="spinner" />}
                                {sending ? "Sending..." : "Send verification email"}
                            </button>
                        </form>
                    )}
                </>
            )}
        </AuthShell>
    );
}

export default function VerifyEmailPage() {
    return <Suspense fallback={<main className="auth-page">Loading...</main>}><VerifyEmailContent /></Suspense>;
}
