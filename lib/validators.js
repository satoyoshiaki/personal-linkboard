import { z } from "zod";
import { iconOptions } from "./icon-map";

export const profileSchema = z.object({
  name: z.string().min(1).max(60),
  bio: z.string().min(1).max(240),
  avatarUrl: z.string().url(),
  backgroundType: z.enum(["gradient", "solid", "image"]),
  backgroundValue: z.string().min(1).max(1000),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  cardColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  textColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  buttonRadius: z.coerce.number().min(12).max(36),
  seoTitle: z.string().min(1).max(70),
  seoDescription: z.string().min(1).max(160),
  faviconUrl: z.string().url().or(z.literal("")),
});

export const linkSchema = z.object({
  title: z.string().min(1).max(60),
  url: z.string().url(),
  icon: z.enum(iconOptions),
  description: z.string().max(120).optional().default(""),
  isVisible: z.union([z.boolean(), z.number()]).transform((value) => {
    if (typeof value === "number") {
      return value ? 1 : 0;
    }
    return value ? 1 : 0;
  }),
  sortOrder: z.coerce.number().min(0).max(999),
});

export const loginSchema = z.object({
  password: z.string().min(8).max(128),
});
