import { NextResponse } from "next/server";
import { isAuthenticated } from "./auth";

export function ensureAdmin(request) {
  const token = request.cookies.get("admin_session")?.value;

  if (!isAuthenticated(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
