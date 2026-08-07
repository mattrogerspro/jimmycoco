import { useNavigate } from "react-router";
import type { ReactNode } from "react";

/**
 * A table row you can click anywhere on.
 *
 * The row itself is deliberately NOT given role="link" or a tabindex — that
 * breaks table semantics for screen readers and puts a stop on every row for
 * keyboard users. Instead the first cell keeps a real anchor, which stays the
 * accessible path, and this only adds a pointer shortcut on top of it.
 */
export function ClickableRow({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <tr
      className={["admin-row-link", className].filter(Boolean).join(" ")}
      onClick={(event) => {
        const target = event.target as HTMLElement | null;
        // Leave real links, buttons and form controls to do their own job.
        if (target?.closest("a, button, input, select, textarea, label")) return;
        // Someone highlighting an email address is not trying to navigate.
        if (window.getSelection()?.toString()) return;
        // Behave like a link would under a modifier key.
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          window.open(to, "_blank", "noopener,noreferrer");
          return;
        }
        navigate(to);
      }}
    >
      {children}
    </tr>
  );
}
