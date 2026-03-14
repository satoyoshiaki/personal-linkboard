"use client";

import Image from "next/image";
import Link from "next/link";
import { iconMap } from "../lib/icon-map";

function LinkButton({ item, accentColor, radius }) {
  const Icon = iconMap[item.icon] || iconMap.ExternalLink;

  return (
    <Link
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group animate-rise rounded-[var(--button-radius)] border border-black/5 bg-white/75 p-4 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-card"
      style={{
        "--button-radius": `${radius}px`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-base font-semibold">{item.title}</p>
            <span
              className="rounded-full px-2 py-1 text-[11px] font-medium tracking-[0.16em] text-white/90"
              style={{ backgroundColor: accentColor }}
            >
              LINK
            </span>
          </div>
          {item.description ? (
            <p className="mt-1 text-sm text-neutral-500">{item.description}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function PublicLinkPage({ profile, links }) {
  const visibleLinks = links.filter((item) => item.isVisible);
  const isImage = profile.backgroundType === "image";
  const backgroundStyle = isImage
    ? {
        backgroundImage: `linear-gradient(rgba(250,250,250,0.82), rgba(250,250,250,0.88)), url(${profile.backgroundValue})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : profile.backgroundType === "solid"
      ? { background: profile.backgroundValue }
      : { backgroundImage: profile.backgroundValue };

  return (
    <main
      className="min-h-screen overflow-hidden px-4 py-6 text-neutral-900 sm:px-6 sm:py-10"
      style={backgroundStyle}
    >
      <div className="mx-auto max-w-xl">
        <div
          className="relative rounded-[32px] border border-white/40 p-5 shadow-card backdrop-blur-xl sm:p-7"
          style={{
            backgroundColor: `${profile.cardColor}cc`,
            color: profile.textColor,
          }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl"
            style={{ backgroundColor: `${profile.accentColor}25` }}
          />
          <div
            className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full blur-3xl"
            style={{ backgroundColor: `${profile.accentColor}12` }}
          />

          <section className="relative animate-rise">
            <div className="mx-auto w-fit rounded-full border border-white/70 bg-white/90 p-2 shadow-soft">
              <div className="relative h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28">
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="112px"
                />
              </div>
            </div>
            <div className="mt-5 text-center">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {profile.name}
              </h1>
              <p
                className="mx-auto mt-3 max-w-md text-sm leading-6 sm:text-[15px]"
                style={{ color: `${profile.textColor}cc` }}
              >
                {profile.bio}
              </p>
            </div>
          </section>

          <section className="relative mt-8 space-y-3">
            {visibleLinks.map((item, index) => (
              <div
                key={item.id ?? `${item.title}-${index}`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <LinkButton
                  item={item}
                  accentColor={profile.accentColor}
                  radius={profile.buttonRadius}
                />
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
