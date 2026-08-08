/**
 * Browser-side sanitiser for the editor's live preview.
 *
 * Deliberately mirrors ARTICLE_HTML_OPTIONS in articles.server.ts rather than
 * pulling in DOMPurify. That is not just about avoiding a dependency: because
 * the allow-list is the same one `cleanArticleHtml()` applies on save, the
 * preview shows exactly what will survive. A tag that is going to be stripped
 * disappears in front of you while you write, instead of silently vanishing
 * after you hit save.
 */

const ALLOWED_TAGS = new Set([
  "P", "BR", "H2", "H3", "H4", "STRONG", "EM", "U", "S", "BLOCKQUOTE",
  "UL", "OL", "LI", "A", "IMG", "FIGURE", "FIGCAPTION", "TABLE", "THEAD",
  "TBODY", "TR", "TH", "TD", "HR", "CODE", "PRE",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(["href", "title", "target", "rel"]),
  IMG: new Set(["src", "alt", "title", "width", "height", "loading"]),
  TH: new Set(["scope", "colspan", "rowspan"]),
  TD: new Set(["colspan", "rowspan"]),
};

const SAFE_SCHEME = /^(https?:|mailto:|\/|#)/i;

export type PreviewResult = { html: string; stripped: string[] };

export function sanitizePreview(input: string): PreviewResult {
  if (typeof window === "undefined" || !input.trim()) return { html: "", stripped: [] };

  const doc = new DOMParser().parseFromString(`<div id="root">${input}</div>`, "text/html");
  const root = doc.getElementById("root");
  if (!root) return { html: "", stripped: [] };

  const stripped = new Set<string>();

  // Drop these entirely, content and all — everything else is unwrapped so the
  // text survives, which is what sanitize-html does server-side.
  for (const node of Array.from(root.querySelectorAll("script, style, iframe, object, embed"))) {
    stripped.add(node.tagName.toLowerCase());
    node.remove();
  }

  const walk = (element: Element) => {
    for (const child of Array.from(element.children)) walk(child);

    if (!ALLOWED_TAGS.has(element.tagName)) {
      stripped.add(element.tagName.toLowerCase());
      // Unwrap: keep the children, lose the element.
      const parent = element.parentNode;
      if (parent) {
        while (element.firstChild) parent.insertBefore(element.firstChild, element);
        parent.removeChild(element);
      }
      return;
    }

    const allowed = ALLOWED_ATTRS[element.tagName] ?? new Set<string>();
    for (const attr of Array.from(element.attributes)) {
      if (!allowed.has(attr.name.toLowerCase())) {
        element.removeAttribute(attr.name);
        continue;
      }
      if ((attr.name === "href" || attr.name === "src") && !SAFE_SCHEME.test(attr.value.trim())) {
        element.removeAttribute(attr.name);
      }
    }

    if (element.tagName === "A") element.setAttribute("rel", "noopener noreferrer");
    if (element.tagName === "IMG") element.setAttribute("loading", "lazy");
  };

  for (const child of Array.from(root.children)) walk(child);

  return { html: root.innerHTML, stripped: [...stripped].sort() };
}

export const countWords = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").split(/\s+/).filter(Boolean).length;

export const estimateMinutes = (html: string) => Math.max(1, Math.round(countWords(html) / 220));

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
