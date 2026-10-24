import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Sedhiou-connect",
    short_name: "Sedhiou-connect",
    description: "Services municipaux numériques de Sédhiou.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#16a34a",
    icons: [
      {
        src: "/sedhiou-logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
