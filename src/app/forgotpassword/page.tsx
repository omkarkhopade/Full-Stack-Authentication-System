"use client";

import AuthShell from "@/components/AuthShell";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "react-hot-toast";

function ForgotPasswordForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState(() => searchParams.get("email") || "");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const requestReset = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post("/api/users/forgotpassword", { email });
            setSent(true);
            toast.success(response.data.message);
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error || error.message
                : "Unable to request a reset link";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            eyebrow="Account recovery"
            title={sent ? "Check your inbox" : "Forgot your password?"}
            subtitle={sent
                ? "We processed your request. Open the secure link in your email to continue."
                : "Enter the email associated with your account and we’ll send a time-limited reset link."}
            footer={<Link href="/login">← Back to sign in</Link>}
        >
            {sent ? (
                <div className="status-card">
                    <span className="status-icon">✓</span>
                    <h2>Email sent</h2>
                    <p>If an account exists for <strong>{email}</strong>, a reset link has been sent to its inbox.</p>
                </div>
            ) : (
                <form className="auth-form" onSubmit={requestReset}>
                    <div className="field">
                        <label htmlFor="email">Email address</label>
                        <input
                            className="input"
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <p className="helper">For your security, reset links expire after one hour and can only be used once.</p>
                    <button className="primary-button" disabled={loading || !email.trim()} type="submit">
                        {loading && <span className="spinner" />}
                        {loading ? "Sending reset link..." : "Send reset link"}
                    </button>
                </form>
            )}
        </AuthShell>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<main className="auth-page">Loading...</main>}>
            <ForgotPasswordForm />
        </Suspense>
    );
}
