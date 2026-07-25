import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
    eyebrow: string;
    title: string;
    subtitle: string;
    children: ReactNode;
    footer?: ReactNode;
};

export default function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
    return (
        <main className="auth-page">
            <div className="auth-orb auth-orb-one" />
            <div className="auth-orb auth-orb-two" />
            <section className="auth-shell">
                <aside className="auth-story">
                    <Link className="brand" href="/">
                        <span className="brand-mark">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 2 4 5.5v5.3c0 5.1 3.4 9.7 8 11.2 4.6-1.5 8-6.1 8-11.2V5.5L12 2Zm3.6 8.1-4.2 4.3a1 1 0 0 1-1.4 0l-2-2 1.4-1.4 1.3 1.3 3.5-3.6 1.4 1.4Z" />
                            </svg>
                        </span>
                        Authly
                    </Link>
                    <div>
                        <span className="story-kicker">Secure by design</span>
                        <h2>Your digital identity, protected at every step.</h2>
                        <p>
                            A thoughtfully built authentication experience with encrypted
                            credentials, secure sessions, and time-limited recovery links.
                        </p>
                    </div>
                    <div className="trust-row">
                        <span>256-bit encryption</span>
                        <span>Private by default</span>
                    </div>
                </aside>

                <div className="auth-panel">
                    <div className="auth-panel-inner">
                        <span className="eyebrow">{eyebrow}</span>
                        <h1>{title}</h1>
                        <p className="auth-subtitle">{subtitle}</p>
                        <div className="auth-form">{children}</div>
                        {footer && <div className="auth-footer">{footer}</div>}
                    </div>
                </div>
            </section>
        </main>
    );
}
