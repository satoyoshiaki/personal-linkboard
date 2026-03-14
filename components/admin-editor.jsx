"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { PublicLinkPage } from "./public-link-page";
import { iconOptions } from "../lib/icon-map";
import { sortLinks } from "../lib/utils";

function createEmptyLink(sortOrder) {
  return {
    id: `draft-${Date.now()}-${sortOrder}`,
    title: "",
    url: "",
    icon: "Globe",
    description: "",
    isVisible: 1,
    sortOrder,
    isDraft: true,
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function AdminEditor({ initialProfile, initialLinks }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [links, setLinks] = useState(sortLinks(initialLinks));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const previewLinks = useMemo(() => sortLinks(links), [links]);

  function updateLinkState(targetId, patch) {
    setLinks((current) =>
      current.map((item) => (item.id === targetId ? { ...item, ...patch } : item)),
    );
  }

  function addLink() {
    setLinks((current) => [...current, createEmptyLink(current.length)]);
  }

  function moveLink(id, direction) {
    setLinks((current) => {
      const next = [...sortLinks(current)];
      const index = next.findIndex((item) => item.id === id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || targetIndex < 0 || targetIndex >= next.length) {
        return current;
      }

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next.map((item, order) => ({ ...item, sortOrder: order }));
    });
  }

  function removeLink(id) {
    startTransition(async () => {
      setError("");
      setMessage("");

      try {
        const target = links.find((item) => item.id === id);
        if (target?.isDraft) {
          setLinks((current) =>
            current
              .filter((item) => item.id !== id)
              .map((item, order) => ({ ...item, sortOrder: order })),
          );
          return;
        }

        await requestJson(`/api/links/${id}`, {
          method: "DELETE",
        });

        setLinks((current) =>
          current
            .filter((item) => item.id !== id)
            .map((item, order) => ({ ...item, sortOrder: order })),
        );
        setMessage("リンクを削除しました。");
      } catch (err) {
        setError(err.message);
      }
    });
  }

  function saveAll() {
    startTransition(async () => {
      setError("");
      setMessage("");

      try {
        const ordered = sortLinks(links).map((item, index) => ({
          ...item,
          sortOrder: index,
        }));

        const profileResult = await requestJson("/api/profile", {
          method: "PUT",
          body: JSON.stringify(profile),
        });

        let workingLinks = ordered;

        for (const link of ordered) {
          if (link.isDraft) {
            const created = await requestJson("/api/links", {
              method: "POST",
              body: JSON.stringify(link),
            });
            workingLinks = workingLinks.map((item) =>
              item.id === link.id ? created.link : item,
            );
          } else {
            const updated = await requestJson(`/api/links/${link.id}`, {
              method: "PUT",
              body: JSON.stringify(link),
            });
            workingLinks = workingLinks.map((item) =>
              item.id === link.id ? updated.link : item,
            );
          }
        }

        const reordered = workingLinks.map((item, index) => ({
          id: item.id,
          sortOrder: index,
        }));

        const orderResult = await requestJson("/api/links/reorder", {
          method: "POST",
          body: JSON.stringify({ items: reordered }),
        });

        setProfile(profileResult.profile);
        setLinks(orderResult.links);
        setMessage("変更を保存しました。公開ページにも即時反映されています。");
        router.refresh();
      } catch (err) {
        setError(err.message);
      }
    });
  }

  async function logout() {
    await requestJson("/api/auth/logout", {
      method: "POST",
    });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f5f5f4] px-4 py-5 text-neutral-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-black/5 bg-white p-5 shadow-card sm:p-7">
          <div className="flex flex-col gap-4 border-b border-black/5 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-neutral-500">
                Admin Panel
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                リンクページを編集
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                保存すると公開ページにすぐ反映されます。
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveAll}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
              >
                <Save size={16} />
                保存
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                <LogOut size={16} />
                ログアウト
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">名前</span>
                <input
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-neutral-900"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">プロフィール画像 URL</span>
                <input
                  value={profile.avatarUrl}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      avatarUrl: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium">自己紹介</span>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, bio: event.target.value }))
                }
                className="w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">テーマカラー</span>
                <input
                  type="color"
                  value={profile.accentColor}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      accentColor: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white p-2"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">ボタン角丸</span>
                <input
                  type="range"
                  min="12"
                  max="36"
                  value={profile.buttonRadius}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      buttonRadius: Number(event.target.value),
                    }))
                  }
                  className="h-12 w-full accent-neutral-900"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">背景タイプ</span>
                <select
                  value={profile.backgroundType}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      backgroundType: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                >
                  <option value="gradient">グラデーション</option>
                  <option value="solid">単色</option>
                  <option value="image">背景画像</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {profile.backgroundType === "image"
                    ? "背景画像 URL"
                    : profile.backgroundType === "solid"
                      ? "背景色"
                      : "CSS グラデーション"}
                </span>
                <input
                  value={profile.backgroundValue}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      backgroundValue: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">カード色</span>
                <input
                  type="color"
                  value={profile.cardColor}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      cardColor: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white p-2"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">文字色</span>
                <input
                  type="color"
                  value={profile.textColor}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      textColor: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white p-2"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">SEO タイトル</span>
                <input
                  value={profile.seoTitle}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      seoTitle: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">favicon URL</span>
                <input
                  value={profile.faviconUrl}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      faviconUrl: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium">SEO 説明文</span>
              <textarea
                rows={3}
                value={profile.seoDescription}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    seoDescription: event.target.value,
                  }))
                }
                className="w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />
            </label>
          </div>

          <div className="mt-8 border-t border-black/5 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">リンク一覧</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  タイトル、URL、表示状態、順序をまとめて編集できます。
                </p>
              </div>
              <button
                type="button"
                onClick={addLink}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-50"
              >
                <Plus size={16} />
                リンク追加
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {previewLinks.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-[28px] border border-black/10 bg-neutral-50 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">タイトル</span>
                      <input
                        value={item.title}
                        onChange={(event) =>
                          updateLinkState(item.id, { title: event.target.value })
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium">URL</span>
                      <input
                        value={item.url}
                        onChange={(event) =>
                          updateLinkState(item.id, { url: event.target.value })
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                      />
                    </label>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr]">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">アイコン</span>
                      <select
                        value={item.icon}
                        onChange={(event) =>
                          updateLinkState(item.id, { icon: event.target.value })
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium">説明文</span>
                      <input
                        value={item.description || ""}
                        onChange={(event) =>
                          updateLinkState(item.id, {
                            description: event.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateLinkState(item.id, { isVisible: item.isVisible ? 0 : 1 })
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm"
                    >
                      {item.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                      {item.isVisible ? "公開中" : "非公開"}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLink(item.id, "up")}
                      disabled={index === 0}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm disabled:opacity-40"
                    >
                      <ArrowUp size={16} />
                      上へ
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLink(item.id, "down")}
                      disabled={index === previewLinks.length - 1}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm disabled:opacity-40"
                    >
                      <ArrowDown size={16} />
                      下へ
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLink(item.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600"
                    >
                      <Trash2 size={16} />
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(message || error) && (
            <div
              className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                error
                  ? "border border-rose-200 bg-rose-50 text-rose-600"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {error || message}
            </div>
          )}
        </section>

        <section className="rounded-[32px] border border-black/5 bg-white p-3 shadow-card sm:p-4 xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:overflow-hidden">
          <div className="mb-3 flex items-center justify-between px-2 py-1">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-neutral-500">
                Live Preview
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                保存前の見た目を右側で確認できます。
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-black/5">
            <PublicLinkPage profile={profile} links={previewLinks} />
          </div>
        </section>
      </div>
    </div>
  );
}
