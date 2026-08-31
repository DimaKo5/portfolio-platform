import { useEffect } from "react";

interface SeoOptions {
  title: string;
  description?: string | null;
  image?: string | null;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useSeo({ title, description, image }: SeoOptions) {
  useEffect(() => {
    document.title = title;
    setMeta("property", "og:title", title);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", window.location.href);
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }
    if (image) {
      setMeta("property", "og:image", new URL(image, window.location.origin).href);
    }
  }, [title, description, image]);
}
