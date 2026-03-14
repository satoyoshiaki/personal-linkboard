import { NextResponse } from "next/server";
import { createSessionToken, verifyPassword } from "../../../../lib/auth";
import { loginSchema } from "../../../../lib/validators";

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const valid = await verifyPassword(parsed.password);

    if (!valid) {
      return NextResponse.json(
        { error: "パスワードが正しくありません。" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_session", createSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "ログインに失敗しました。" },
      { status: 400 },
    );
  }
}
