import { verifySessionToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export const getDataFromToken = (request: NextRequest) => {
    return verifySessionToken(request.cookies.get("token")?.value);
};
