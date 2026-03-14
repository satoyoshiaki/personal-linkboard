import { clsx } from "clsx";

export function cn(...inputs) {
  return clsx(inputs);
}

export function normalizeColor(value, fallback) {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  return hexPattern.test(trimmed) ? trimmed : fallback;
}

export function normalizeRadius(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 24;
  }

  return Math.min(36, Math.max(12, numeric));
}

export function sortLinks(links) {
  return [...links].sort((a, b) => a.sortOrder - b.sortOrder);
}
