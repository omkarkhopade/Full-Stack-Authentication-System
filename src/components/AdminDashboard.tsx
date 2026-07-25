"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type AdminUser = {
    _id: string;
    username: string;
    email: string;
    isVerified: boolean;
    isAdmin: boolean;
    createdAt: string;
};

type UsersResponse = {
    users: AdminUser[];
    pagination: { page: number; limit: number; total: number; pages: number };
    currentAdminId: string;
};

export default function AdminDashboard() {
    const [data, setData] = useState<UsersResponse | null>(null);
    const [search, setSearch] = useState("");
    const [activeSearch, setActiveSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        axios.get<UsersResponse>("/api/admin/users", { params: { search: activeSearch, page } })
            .then((response) => {
                if (active) setData(response.data);
            })
            .catch((error: unknown) => {
                if (active) {
                    const message = axios.isAxiosError(error)
                        ? error.response?.data?.error || "Unable to load users"
                        : "Unable to load users";
                    toast.error(message);
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [activeSearch, page]);

    const refresh = async () => {
        const response = await axios.get<UsersResponse>("/api/admin/users", {
            params: { search: activeSearch, page },
        });
        setData(response.data);
    };

    const updateUser = async (userId: string, changes: { isAdmin?: boolean; isVerified?: boolean }) => {
        try {
            await axios.patch("/api/admin/users", { userId, ...changes });
            toast.success("User updated");
            await refresh();
        } catch (error: unknown) {
            toast.error(axios.isAxiosError(error) ? error.response?.data?.error || "Update failed" : "Update failed");
        }
    };

    const deleteUser = async (user: AdminUser) => {
        if (!window.confirm(`Permanently delete ${user.email}? This cannot be undone.`)) return;
        try {
            await axios.delete("/api/admin/users", { data: { userId: user._id } });
            toast.success("User deleted");
            if (data?.users.length === 1 && page > 1) setPage((current) => current - 1);
            else await refresh();
        } catch (error: unknown) {
            toast.error(axios.isAxiosError(error) ? error.response?.data?.error || "Delete failed" : "Delete failed");
        }
    };

    const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setPage(1);
        setActiveSearch(search.trim());
    };

    return (
        <main className="admin-page">
            <nav className="dashboard-nav">
                <Link className="brand" href="/profile">
                    <span className="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5.5v5.3c0 5.1 3.4 9.7 8 11.2 4.6-1.5 8-6.1 8-11.2V5.5L12 2Zm3.6 8.1-4.2 4.3a1 1 0 0 1-1.4 0l-2-2 1.4-1.4 1.3 1.3 3.5-3.6 1.4 1.4Z" /></svg></span>
                    Authly Admin
                </Link>
                <Link className="secondary-button" href="/profile">Back to profile</Link>
            </nav>

            <section className="admin-content">
                <div className="admin-heading">
                    <div>
                        <span className="eyebrow">Administration</span>
                        <h1>User management</h1>
                        <p>Review accounts, verification status, and administrator access.</p>
                    </div>
                    <div className="admin-stat"><strong>{data?.pagination.total ?? "—"}</strong><span>Total users</span></div>
                </div>

                <form className="admin-search" onSubmit={submitSearch}>
                    <input
                        className="input"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by username or email"
                        aria-label="Search users"
                    />
                    <button className="primary-button" type="submit">Search</button>
                </form>

                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead><tr><th>User</th><th>Joined</th><th>Verified</th><th>Role</th><th><span className="sr-only">Actions</span></th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="empty-state">Loading users...</td></tr>
                            ) : data?.users.length ? data.users.map((user) => {
                                const isSelf = user._id === data.currentAdminId;
                                return (
                                    <tr key={user._id}>
                                        <td><div className="table-user"><span>{user.username.slice(0, 1).toUpperCase()}</span><div><strong>{user.username}</strong><small>{user.email}</small></div></div></td>
                                        <td>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(user.createdAt))}</td>
                                        <td><button className={`status-pill ${user.isVerified ? "verified" : "pending"}`} onClick={() => updateUser(user._id, { isVerified: !user.isVerified })}>{user.isVerified ? "Verified" : "Pending"}</button></td>
                                        <td><button className={`role-button ${user.isAdmin ? "admin" : ""}`} disabled={isSelf} onClick={() => updateUser(user._id, { isAdmin: !user.isAdmin })}>{user.isAdmin ? "Admin" : "User"}</button></td>
                                        <td><button className="danger-button" disabled={isSelf} onClick={() => deleteUser(user)}>Delete</button></td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={5} className="empty-state">No users match your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {data && data.pagination.pages > 1 && (
                    <div className="pagination">
                        <button className="secondary-button" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1); }}>Previous</button>
                        <span>Page {page} of {data.pagination.pages}</span>
                        <button className="secondary-button" disabled={page >= data.pagination.pages} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>Next</button>
                    </div>
                )}
            </section>
        </main>
    );
}
