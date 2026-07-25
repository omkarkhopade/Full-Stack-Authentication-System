import Link from "next/link";

export default function Home() {
    return (
        <main className="dashboard-page">
            <section className="hero">
                <span className="eyebrow">Authentication you can trust</span>
                <h1>Simple access.<br />Serious security.</h1>
                <p>Authly protects every step—from signup and verification to session management and account recovery.</p>
                <div className="hero-actions">
                    <Link className="primary-button" href="/profile">Open your profile</Link>
                    <Link className="secondary-button" href="/login">Sign in</Link>
                </div>
            </section>
        </main>
    );
}
