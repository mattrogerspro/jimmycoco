import { Link } from "react-router";

/** Shared pagination control for the admin lists. */
export function Pager({
  page,
  pageCount,
  hrefFor,
  label = "Pages",
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  label?: string;
}) {
  if (pageCount <= 1) return null;

  // A short window of page numbers around the current one.
  const numbers: number[] = [];
  const start = Math.max(1, Math.min(page - 3, pageCount - 6));
  for (let index = start; index <= Math.min(pageCount, start + 6); index += 1) numbers.push(index);

  const first = page === 1;
  const last = page === pageCount;

  return (
    <nav className="admin-pager" aria-label={label}>
      <Link to={hrefFor(1)} className={first ? "is-disabled" : undefined} aria-disabled={first} preventScrollReset>
        First
      </Link>
      <Link
        to={hrefFor(Math.max(1, page - 1))}
        className={first ? "is-disabled" : undefined}
        aria-disabled={first}
        rel="prev"
        preventScrollReset
      >
        Previous
      </Link>
      <span className="admin-pager-pages">
        {numbers.map((number) => (
          <Link
            key={number}
            to={hrefFor(number)}
            className={number === page ? "is-current" : undefined}
            aria-current={number === page ? "page" : undefined}
            preventScrollReset
          >
            {number}
          </Link>
        ))}
      </span>
      <Link
        to={hrefFor(Math.min(pageCount, page + 1))}
        className={last ? "is-disabled" : undefined}
        aria-disabled={last}
        rel="next"
        preventScrollReset
      >
        Next
      </Link>
      <Link to={hrefFor(pageCount)} className={last ? "is-disabled" : undefined} aria-disabled={last} preventScrollReset>
        Last
      </Link>
      <span className="admin-pager-count">
        Page {page} of {pageCount}
      </span>
    </nav>
  );
}
