import { createClient } from "@sanity/client";
import { fallbackContent, type SiteContent } from "../content/fallback";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.VITE_SANITY_DATASET as string | undefined) ?? "production";

export const sanityEnabled = Boolean(projectId);

const client = projectId
  ? createClient({ projectId, dataset, apiVersion: "2024-01-01", useCdn: true })
  : null;

const query = /* groq */ `{
  "settings": *[_type == "siteSettings"][0]{
    "heroImage": heroImage.asset->url,
    "aboutImage": aboutImage.asset->url,
    "founderImage": founderImage.asset->url,
    stats,
    contact
  },
  "projects": *[_type == "project"] | order(order asc){
    "id": _id,
    title,
    description,
    "image": image.asset->url
  },
  "gallery": *[_type == "galleryImage"] | order(order asc){
    "src": image.asset->url,
    tall,
    caption
  }
}`;

/**
 * Loads content from Sanity when VITE_SANITY_PROJECT_ID is configured,
 * merging with local fallback content. Without Sanity, returns fallback.
 */
export async function loadContent(): Promise<SiteContent> {
  if (!client) return fallbackContent;
  try {
    const data = await client.fetch(query);
    return {
      heroImage: data.settings?.heroImage ?? fallbackContent.heroImage,
      aboutImage: data.settings?.aboutImage ?? fallbackContent.aboutImage,
      founderImage: data.settings?.founderImage ?? fallbackContent.founderImage,
      stats: { ...fallbackContent.stats, ...data.settings?.stats },
      contact: { ...fallbackContent.contact, ...data.settings?.contact },
      projects: data.projects?.length ? data.projects : fallbackContent.projects,
      gallery: data.gallery?.length ? data.gallery : fallbackContent.gallery,
    };
  } catch (err) {
    console.warn("Sanity fetch failed, using fallback content", err);
    return fallbackContent;
  }
}
