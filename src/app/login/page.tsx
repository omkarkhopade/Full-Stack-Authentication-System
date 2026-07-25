"use client";

import AuthShell from "@/components/AuthShell";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function LoginPage() {
    const [user, setUser] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const buttonDisabled = !user.email.trim() || !user.password;

    const onLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setLoading(true);
            setShowForgotPassword(false);
            setNeedsVerification(false);
            const response = await axios.post("/api/users/login", user);
            toast.success(response.data.message || "Welcome back");
            window.location.assign("/profile");
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error || error.message
                : "Login failed";
            const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
            setShowForgotPassword(message === "Invalid email or password");
            setNeedsVerification(code === "EMAIL_NOT_VERIFIED");
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            eyebrow="Welcome back"
            title="Sign in to your account"
            subtitle="Enter your credentials to continue to your secure workspace."
            footer={<>New to Authly? <Link href="/signup">Create an account</Link></>}
        >
            <form className="auth-form" onSubmit={onLogin}>
                <div className="field">
                    <label htmlFor="email">Email address</label>
                    <input
                        className="input"
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={user.email}
                        onChange={(event) => setUser({ ...user, email: event.target.value })}
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div className="field">
                    <div className="field-row">
                        <label htmlFor="password">Password</label>
                        {showForgotPassword && (
                            <Link className="text-link" href={`/forgotpassword?email=${encodeURIComponent(user.email)}`}>
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <div className="input-wrap">
                        <input
                            className="input input-password"
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            value={user.password}
                            onChange={(event) => setUser({ ...user, password: event.target.value })}
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            className="password-toggle"
                            type="button"
                            onClick={() => setShowPassword((visible) => !visible)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                <button className="primary-button" disabled={buttonDisabled || loading} type="submit">
                    {loading && <span className="spinner" />}
                    {loading ? "Signing in..." : "Sign in securely"}
                </button>
                {needsVerification && (
                    <div className="verification-notice">
                        <div>
                            <strong>Email verification required</strong>
                            <span>Request a fresh link if the original email expired.</span>
                        </div>
                        <Link className="text-link" href={`/verifyemail?email=${encodeURIComponent(user.email)}`}>
                            Verify email
                        </Link>
                    </div>
                )}
            </form>
        </AuthShell>
    );
}
