import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextRequest } from "next/server";

type SessionPayload = JwtPayload & { id: string };

export class AuthorizationError extends Error {
    constructor(
        message: string,
        public readonly status: 401 | 403
    ) {
        super(message);
    }
}

export function verifySessionToken(token?: string) {
    const secret = process.env.TOKEN_SECRET;
    if (!token || !secret) throw new AuthorizationError("Unauthorized", 401);

    try {
        const payload = jwt.verify(token, secret) as SessionPayload;
        if (!payload.id) throw new Error("Missing user ID");
        return payload.id;
    } catch {
        throw new AuthorizationError("Unauthorized", 401);
    }
}

export async function requireAdminFromToken(token?: string) {
    const userId = verifySessionToken(token);
    await connect();
    const user = await User.findById(userId);

    if (!user) throw new AuthorizationError("Unauthorized", 401);
    if (!user.isAdmin) throw new AuthorizationError("Administrator access required", 403);
    return user;
}

export function requireAdmin(request: NextRequest) {
    return requireAdminFromToken(request.cookies.get("token")?.value);
}
