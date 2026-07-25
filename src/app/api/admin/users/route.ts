import { AuthorizationError, requireAdmin } from "@/lib/auth";
import User from "@/models/userModel";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const handleError = (error: unknown) => {
    if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unable to complete admin request" }, { status: 500 });
};

export async function GET(request: NextRequest) {
    try {
        const admin = await requireAdmin(request);
        const search = request.nextUrl.searchParams.get("search")?.trim().slice(0, 100) || "";
        const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
        const limit = 20;
        const query = search
            ? {
                $or: [
                    { username: { $regex: escapeRegex(search), $options: "i" } },
                    { email: { $regex: escapeRegex(search), $options: "i" } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            User.find(query)
                .select("username email isVerified isAdmin createdAt")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        return NextResponse.json({
            users,
            pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
            currentAdminId: admin._id.toString(),
        });
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const admin = await requireAdmin(request);
        const body: unknown = await request.json();
        if (!body || typeof body !== "object") {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const values = body as Record<string, unknown>;
        const userId = typeof values.userId === "string" ? values.userId : "";
        if (!isValidObjectId(userId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const updates: { isAdmin?: boolean; isVerified?: boolean } = {};
        if (typeof values.isAdmin === "boolean") updates.isAdmin = values.isAdmin;
        if (typeof values.isVerified === "boolean") updates.isVerified = values.isVerified;
        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No valid changes supplied" }, { status: 400 });
        }

        if (admin._id.toString() === userId && updates.isAdmin === false) {
            return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).select("username email isVerified isAdmin createdAt");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "User updated successfully", user });
    } catch (error) {
        return handleError(error);
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const admin = await requireAdmin(request);
        const body: unknown = await request.json();
        const userId = body && typeof body === "object" && typeof (body as Record<string, unknown>).userId === "string"
            ? (body as Record<string, unknown>).userId as string
            : "";

        if (!isValidObjectId(userId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }
        if (admin._id.toString() === userId) {
            return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        return handleError(error);
    }
}
