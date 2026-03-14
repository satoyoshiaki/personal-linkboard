export const defaultProfile = {
  name: "Your Name",
  bio: "Short, polished introduction. Add your profile, favorite links, and anything you want people to reach quickly.",
  avatarUrl:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  backgroundType: "gradient",
  backgroundValue:
    "linear-gradient(135deg, rgba(249,250,251,1) 0%, rgba(229,231,235,1) 45%, rgba(243,244,246,1) 100%)",
  accentColor: "#111111",
  cardColor: "#ffffff",
  textColor: "#111827",
  buttonRadius: 24,
  seoTitle: "Your Name | Links",
  seoDescription: "A minimal personal links page.",
  faviconUrl: "",
};

export const defaultLinks = [
  {
    title: "Portfolio",
    url: "https://example.com",
    icon: "Globe",
    description: "Selected work and profile",
    isVisible: 1,
    sortOrder: 0,
  },
  {
    title: "X / Twitter",
    url: "https://x.com",
    icon: "Twitter",
    description: "Short updates and thoughts",
    isVisible: 1,
    sortOrder: 1,
  },
  {
    title: "GitHub",
    url: "https://github.com",
    icon: "Github",
    description: "Code, experiments, and OSS",
    isVisible: 1,
    sortOrder: 2,
  },
];
