"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "ログインに失敗しました。");
        return;
      }

      router.push(nextPath);
      router.refresh();
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f4] px-4">
      <div className="w-full max-w-md rounded-[32px] border border-black/5 bg-white p-6 shadow-card sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white">
          <LockKeyhole size={22} />
        </div>
        <div className="mt-5 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-neutral-500">
            Private Access
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            管理画面にログイン
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            個人運用向けのため、単一パスワード認証で保護しています。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              placeholder="********"
              autoFocus
            />
          </label>
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
          >
            ログイン
          </button>
        </form>
      </div>
    </main>
  );
}
