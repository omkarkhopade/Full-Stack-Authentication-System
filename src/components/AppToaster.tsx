"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: "#10182b",
                    color: "#f8fafc",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "14px",
                },
            }}
        />
    );
}
