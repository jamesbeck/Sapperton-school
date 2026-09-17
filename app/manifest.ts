import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sapperton Church of England Primary School",
    short_name: "Sapperton School",
    description:
      "A warm village school in the heart of the Cotswolds, nurturing faith and inspiring success.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#347560",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
