import { useEffect } from "react";
import { useLocation } from "react-router";
import { track, trackOnce } from "../../lib/analytics";

const SCROLL_MARKS = [25, 50, 75, 90] as const;

function labelFor(element: HTMLElement) {
  const explicit = element.getAttribute("data-track-label");
  if (explicit) return explicit;
  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
  return text || element.getAttribute("aria-label") || element.getAttribute("title") || "unlabelled";
}

function sectionOf(element: HTMLElement) {
  const section = element.closest("section, header, footer, form");
  if (!section) return "page";
  return (
    section.getAttribute("id") ||
    section.getAttribute("data-section") ||
    section.className.toString().split(" ")[0] ||
    section.tagName.toLowerCase()
  );
}

/**
 * Site-wide GA4 instrumentation. Delegated listeners mean new links, buttons and
 * fields are tracked automatically without touching each component.
 */
export function AnalyticsBridge() {
  const location = useLocation();

  // SPA navigations — gtag only sends the first page_view by itself.
  useEffect(() => {
    track("page_view", {
      page_path: location.pathname + location.search,
      page_title: typeof document !== "undefined" ? document.title : undefined,
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      const button = target.closest("button") as HTMLButtonElement | null;
      const element = anchor ?? button;
      if (!element) return;

      const label = labelFor(element);
      const section = sectionOf(element);

      if (anchor) {
        const href = anchor.getAttribute("href") ?? "";
        const isExternal = /^https?:\/\//i.test(href) && !href.includes(window.location.host);
        const isAnchor = href.startsWith("#");
        track(isExternal ? "outbound_click" : isAnchor ? "anchor_click" : "link_click", {
          link_label: label,
          link_url: href,
          section,
        });
        if (anchor.classList.contains("btn") || anchor.classList.contains("portal-btn")) {
          track("cta_click", { cta_label: label, cta_url: href, section });
        }
        return;
      }

      if (button) {
        const isSubmit = button.type === "submit";
        track(isSubmit ? "form_submit_click" : "button_click", {
          button_label: label,
          section,
          form_id: button.form?.getAttribute("class") ?? undefined,
        });
      }
    };

    // Capture phase: focus/blur do not bubble.
    const onFocus = (event: FocusEvent) => {
      const field = event.target as HTMLElement | null;
      if (!field || !field.matches("input, select, textarea")) return;
      const form = field.closest("form");
      const formId = form?.getAttribute("data-form-id") ?? form?.className.split(" ")[0] ?? "form";
      trackOnce(`form_start_${formId}`, "form_start", { form_id: formId });
      track("form_field_focus", { form_id: formId, field_name: field.getAttribute("name") ?? field.id });
    };

    const onBlur = (event: FocusEvent) => {
      const field = event.target as HTMLInputElement | null;
      if (!field || !field.matches("input, select, textarea")) return;
      if (field.type === "password" || field.type === "hidden") return;
      const form = field.closest("form");
      const formId = form?.getAttribute("data-form-id") ?? form?.className.split(" ")[0] ?? "form";
      track("form_field_complete", {
        form_id: formId,
        field_name: field.getAttribute("name") ?? field.id,
        completed: Boolean(field.value),
      });
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (!form) return;
      const formId = form.getAttribute("data-form-id") ?? form.className.split(" ")[0] ?? "form";
      track("form_submit", { form_id: formId });
    };

    let deepest = 0;
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      const percent = Math.round((doc.scrollTop / scrollable) * 100);
      for (const mark of SCROLL_MARKS) {
        if (percent >= mark && deepest < mark) {
          deepest = mark;
          track("scroll_depth", { percent_scrolled: mark });
        }
      }
    };

    document.addEventListener("click", onClick);
    document.addEventListener("focus", onFocus, true);
    document.addEventListener("blur", onBlur, true);
    document.addEventListener("submit", onSubmit);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("focus", onFocus, true);
      document.removeEventListener("blur", onBlur, true);
      document.removeEventListener("submit", onSubmit);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Which sections actually get seen.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sections = Array.from(document.querySelectorAll("section[id], section[data-section]"));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          const name = element.id || element.getAttribute("data-section") || "section";
          trackOnce(`section_${name}`, "section_view", { section: name });
        }
      },
      { threshold: 0.4 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname]);

  return null;
}
