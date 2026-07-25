import { requireAdminFromToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const token = (await cookies()).get("token")?.value;

    try {
        await requireAdminFromToken(token);
    } catch {
        redirect("/profile");
    }

    return children;
}
