import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "default",
  title: "Casa Esperança Real Crescer",
  // Preencha com o ID do projeto criado em https://sanity.io/manage
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "SEU_PROJECT_ID",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
