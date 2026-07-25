"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type Profile = { username: string; email: string; isVerified: boolean; isAdmin: boolean };

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        axios.get("/api/users/me")
            .then((response) => setProfile(response.data.data))
            .catch(() => toast.error("Unable to load your profile"));
    }, []);

    const logout = async () => {
        try {
            await axios.post("/api/users/logout");
            toast.success("Signed out successfully");
            router.replace("/login");
        } catch {
            toast.error("Unable to sign out");
        }
    };

    return (
        <main className="dashboard-page">
            <nav className="dashboard-nav">
                <div className="brand"><span className="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5.5v5.3c0 5.1 3.4 9.7 8 11.2 4.6-1.5 8-6.1 8-11.2V5.5L12 2Zm3.6 8.1-4.2 4.3a1 1 0 0 1-1.4 0l-2-2 1.4-1.4 1.3 1.3 3.5-3.6 1.4 1.4Z" /></svg></span>Authly</div>
                <div className="profile-actions">
                    {profile?.isAdmin && <Link className="primary-button" href="/admin">Admin dashboard</Link>}
                    {profile && !profile.isVerified && (
                        <Link className="primary-button" href={`/verifyemail?email=${encodeURIComponent(profile.email)}`}>
                            Verify email
                        </Link>
                    )}
                    <button className="secondary-button" onClick={logout}>Sign out</button>
                </div>
            </nav>
            <section className="dashboard-content">
                <span className="eyebrow">Account overview</span>
                <h1>{profile ? `Good to see you, ${profile.username}` : "Loading your workspace..."}</h1>
                <p className="dashboard-lead">Manage your identity and review the security status of your account.</p>
                <div className="dashboard-grid">
                    <article className="profile-card">
                        <div className="avatar">{profile?.username?.slice(0, 1).toUpperCase() || "A"}</div>
                        <div><span className="card-label">Signed in as</span><h2>{profile?.username || "Loading..."}</h2><p>{profile?.email || "Retrieving details"}</p></div>
                    </article>
                    <article className="security-card">
                        <div className="security-heading">
                            <div><span className="card-label">Security status</span><h2>Account protection</h2></div>
                            <span className={`status-pill ${profile?.isVerified ? "verified" : "pending"}`}>{profile?.isVerified ? "Verified" : "Pending"}</span>
                        </div>
                        <div className="security-item"><span>Email verification</span><strong>{profile?.isVerified ? "Complete" : "Required"}</strong></div>
                        <div className="security-item"><span>Password encryption</span><strong>Active</strong></div>
                        <div className="security-item"><span>Session protection</span><strong>Active</strong></div>
                    </article>
                </div>
            </section>
        </main>
    );
}
