// Site content that is not translated text. Translations live in src/i18n/*.json.

export interface Project {
  id: string;
  /** Key under projects.items.* in the translation files */
  i18nKey: string;
  image: string;
}

export interface GalleryImage {
  src: string;
  tall?: boolean;
  /** Key under gallery.captions.* in the translation files */
  captionKey: string;
}

export interface SiteContent {
  heroImage: string;
  aboutImage: string;
  founderImage: string;
  projects: Project[];
  gallery: GalleryImage[];
  stats: { years: number; communities: number; countries: number; founded: number };
  contact: {
    orgName: string;
    cnpj: string;
    address: string;
    phones: string[];
    /** Digits only, with country code (e.g. 5521988407300) */
    whatsapp: string;
    email: string;
  };
}

export const siteContent: SiteContent = {
  heroImage: "/images/img001.jpeg",
  aboutImage: "/images/img015.jpeg",
  founderImage: "/images/img005.jpeg",
  projects: [
    { id: "congo", i18nKey: "congo", image: "/images/img002.jpeg" },
    { id: "housing", i18nKey: "housing", image: "/images/img010.jpeg" },
    { id: "refugees", i18nKey: "refugees", image: "/images/img012.jpeg" },
    { id: "community", i18nKey: "community", image: "/images/img015.jpeg" },
  ],
  gallery: [
    { src: "/images/img003.jpeg", tall: true, captionKey: "img003" },
    { src: "/images/img004.jpeg", captionKey: "img004" },
    { src: "/images/img006.jpeg", captionKey: "img006" },
    { src: "/images/img007.jpeg", tall: true, captionKey: "img007" },
    { src: "/images/img008.jpeg", captionKey: "img008" },
    { src: "/images/img009.jpeg", captionKey: "img009" },
    { src: "/images/img011.jpeg", captionKey: "img011" },
    { src: "/images/img013.jpeg", captionKey: "img013" },
    { src: "/images/img014.jpeg", captionKey: "img014" },
  ],
  stats: { years: new Date().getFullYear() - 1998, communities: 30, countries: 3, founded: 2010 },
  contact: {
    orgName: "Casa Esperança Real Crescer",
    cnpj: "09.563.258/0001-70",
    address: "Rua Piriá, 105 – Brás de Pina, Rio de Janeiro – RJ, CEP 21011-460",
    phones: ["(21) 98840-7300", "(21) 98415-2127", "(21) 98620-2697"],
    whatsapp: "5521988407300",
    email: "casaesperancarealcrescer@gmail.com",
  },
};
