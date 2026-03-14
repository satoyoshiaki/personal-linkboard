import { PublicLinkPage } from "../components/public-link-page";
import { getLinks, getProfile } from "../lib/db";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const profile = getProfile();
  const links = getLinks();

  return <PublicLinkPage profile={profile} links={links} />;
}
