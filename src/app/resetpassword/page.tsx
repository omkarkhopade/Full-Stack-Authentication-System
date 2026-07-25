"use client";

import AuthShell from "@/components/AuthShell";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "react-hot-toast";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("/api/users/resetpassword", { token, password });
            toast.success(`${response.data.message}. You can now sign in.`);
            router.replace("/login");
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error || error.message
                : "Unable to reset password";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <AuthShell
                eyebrow="Invalid link"
                title="This reset link is incomplete"
                subtitle="The URL does not include a password reset token. Request a fresh email to continue."
                footer={<Link href="/login">Back to sign in</Link>}
            >
                <Link className="primary-button" href="/forgotpassword">Request a new reset link</Link>
            </AuthShell>
        );
    }

    const passwordsMatch = password === confirmPassword;

    return (
        <AuthShell
            eyebrow="Choose a new password"
            title="Reset your password"
            subtitle="Create a strong password you haven’t used for this account before."
            footer={<Link href="/login">Cancel and return to sign in</Link>}
        >
            <form className="auth-form" onSubmit={resetPassword}>
                <div className="field">
                    <label htmlFor="password">New password</label>
                    <div className="input-wrap">
                        <input
                            className="input input-password"
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            minLength={8}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="At least 8 characters"
                            required
                        />
                        <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)}>
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                <div className="field">
                    <label htmlFor="confirmPassword">Confirm new password</label>
                    <input
                        className="input"
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Enter it once more"
                        required
                    />
                    {confirmPassword && !passwordsMatch && <span className="helper" style={{ color: "#fb7185" }}>Passwords do not match.</span>}
                </div>
                <button
                    className="primary-button"
                    disabled={loading || password.length < 8 || !passwordsMatch}
                    type="submit"
                >
                    {loading && <span className="spinner" />}
                    {loading ? "Updating password..." : "Save new password"}
                </button>
            </form>
        </AuthShell>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<main className="auth-page">Loading...</main>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
