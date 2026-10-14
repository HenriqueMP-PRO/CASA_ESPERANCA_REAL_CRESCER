import { defineField, defineType, type StringRule } from "sanity";

const localizedString = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "pt", title: "Português", type: "string" },
      { name: "en", title: "English", type: "string" },
      { name: "fr", title: "Français", type: "string" },
    ],
  });

const localizedText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "pt", title: "Português", type: "text" },
      { name: "en", title: "English", type: "text" },
      { name: "fr", title: "Français", type: "text" },
    ],
  });

const project = defineType({
  name: "project",
  title: "Projeto",
  type: "document",
  fields: [
    localizedString("title", "Título"),
    localizedText("description", "Descrição"),
    defineField({ name: "image", title: "Imagem", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Ordem", type: "number", initialValue: 0 }),
  ],
  preview: {
    select: { title: "title.pt", media: "image" },
  },
});

const galleryImage = defineType({
  name: "galleryImage",
  title: "Imagem da Galeria",
  type: "document",
  fields: [
    defineField({ name: "image", title: "Imagem", type: "image", options: { hotspot: true } }),
    localizedString("caption", "Legenda (também usada como descrição para leitores de tela)"),
    defineField({
      name: "tall",
      title: "Imagem alta (ocupa 2 linhas)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "order", title: "Ordem", type: "number", initialValue: 0 }),
  ],
  preview: {
    select: { title: "caption.pt", media: "image" },
    prepare: ({ title, media }) => ({ title: title || "Imagem da galeria", media }),
  },
});

const siteSettings = defineType({
  name: "siteSettings",
  title: "Configurações do Site",
  type: "document",
  fields: [
    defineField({ name: "heroImage", title: "Imagem principal (Hero)", type: "image" }),
    defineField({ name: "aboutImage", title: "Imagem — Nossa História", type: "image" }),
    defineField({ name: "founderImage", title: "Foto do Fundador", type: "image" }),
    defineField({
      name: "stats",
      title: "Números",
      type: "object",
      fields: [
        { name: "years", title: "Anos de missão", type: "number" },
        { name: "communities", title: "Comunidades atendidas", type: "number" },
        { name: "countries", title: "Países alcançados", type: "number" },
        { name: "founded", title: "Ano de fundação", type: "number" },
      ],
    }),
    defineField({
      name: "contact",
      title: "Contato",
      type: "object",
      fields: [
        { name: "orgName", title: "Nome da organização", type: "string" },
        { name: "cnpj", title: "CNPJ", type: "string" },
        { name: "address", title: "Endereço", type: "string" },
        { name: "phones", title: "Telefones", type: "array", of: [{ type: "string" }] },
        {
          name: "whatsapp",
          title: "WhatsApp (somente números, com 55 e DDD)",
          type: "string",
          validation: (rule: StringRule) => rule.regex(/^55\d{10,11}$/),
        },
        { name: "email", title: "E-mail", type: "string" },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Configurações do Site" }) },
});

export const schemaTypes = [siteSettings, project, galleryImage];
