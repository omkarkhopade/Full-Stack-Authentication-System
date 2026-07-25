import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/GetDataFromToken";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userId = getDataFromToken(request);
        await connect();
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "User found", data: user });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
