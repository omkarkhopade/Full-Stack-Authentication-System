"use client";

import AuthShell from "@/components/AuthShell";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function SignupPage() {
    const [user, setUser] = useState({ email: "", password: "", username: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [signupComplete, setSignupComplete] = useState(false);
    const buttonDisabled = !user.email.trim() || !user.password || !user.username.trim();

    const onSignup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            toast.success(response.data.message || "Account created");
            setSignupComplete(true);
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error || error.message
                : "Signup failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            eyebrow="Get started"
            title={signupComplete ? "Verify your email" : "Create your account"}
            subtitle={signupComplete
                ? "Your account was created successfully. One final security step remains."
                : "Join in seconds. Your credentials are encrypted before they are stored."}
            footer={<>Already have an account? <Link href="/login">Sign in</Link></>}
        >
            {signupComplete ? (
                <>
                    <div className="status-card">
                        <span className="status-icon">✉</span>
                        <h2>Check your inbox</h2>
                        <p>
                            We sent a verification link to <strong>{user.email}</strong>.
                            Open it before signing in. The link expires in one hour.
                        </p>
                    </div>
                    <Link className="primary-button" href={`/verifyemail?email=${encodeURIComponent(user.email)}`}>
                        Verification options
                    </Link>
                    <Link className="secondary-button" href="/login">Continue to sign in</Link>
                </>
            ) : <form className="auth-form" onSubmit={onSignup}>
                <div className="field">
                    <label htmlFor="username">Username</label>
                    <input
                        className="input"
                        id="username"
                        autoComplete="username"
                        value={user.username}
                        onChange={(event) => setUser({ ...user, username: event.target.value })}
                        placeholder="Choose a username"
                        required
                    />
                </div>
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
                    <label htmlFor="password">Password</label>
                    <div className="input-wrap">
                        <input
                            className="input input-password"
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            minLength={8}
                            value={user.password}
                            onChange={(event) => setUser({ ...user, password: event.target.value })}
                            placeholder="At least 8 characters"
                            required
                        />
                        <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)}>
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                <button className="primary-button" disabled={buttonDisabled || loading} type="submit">
                    {loading && <span className="spinner" />}
                    {loading ? "Creating account..." : "Create secure account"}
                </button>
            </form>}
        </AuthShell>
    );
}
