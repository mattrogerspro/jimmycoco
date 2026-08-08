type FaqRow = { question: string; answer: string };
type CiteRow = { text: string; url: string };
type EditorMode = "write" | "split" | "preview";

const SITE = "www.jimmycoco.pro";

function Counter({ value, ideal, max }: { value: number; ideal?: [number, number]; max?: number }) {
  const over = max !== undefined && value > max;
  const good = ideal ? value >= ideal[0] && value <= ideal[1] : !over && value > 0;
  return (
    <span className={`ed-counter${over ? " is-over" : good ? " is-good" : ""}`}>
      {value}
      {max ? `/${max}` : ""} characters
      {ideal && !good && !over ? ` · aim for ${ideal[0]}–${ideal[1]}` : ""}
    </span>
  );
}

export default function AdminArticleEditor() {
  const { article, tags, revisions, staff, categories, authors }: any = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const formRef = useRef<HTMLFormElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const initial = useMemo(
    () => ({
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      excerpt: article?.excerpt ?? "",
      content: article?.content_html ?? "",
      status: article?.status ?? "draft",
      readingTime: String(article?.reading_time_minutes ?? 5),
      featured: Boolean(article?.is_featured),
      noindex: Boolean(article?.noindex),
      author: article?.author?.name ?? "Sunless by Jimmy Coco Trade Team",
      category: article?.category?.name ?? "",
      tagsCsv: (tags ?? []).join(", "),
      coverAlt: article?.cover?.alt_text ?? "",
      seoTitle: article?.seo_title ?? "",
      metaDescription: article?.meta_description ?? "",
      ogTitle: article?.og_title ?? "",
      ogDescription: article?.og_description ?? "",
      keywordsCsv: (article?.keywords ?? []).join(", "),
      faq: (article?.faq_items ?? []) as FaqRow[],
      citations: (article?.citations ?? []).map((c: any) => ({ text: c.text ?? "", url: c.url ?? "" })) as CiteRow[],
    }),
    [article, tags],
  );

  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug));
  const [mode, setMode] = useState<EditorMode>("write");
  const [coverChosen, setCoverChosen] = useState(false);
  const [openFaq, setOpenFaq] = useState(false);
  const [openSources, setOpenSources] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const words = useMemo(() => countWords(form.content), [form.content]);
  const calculated = useMemo(() => estimateMinutes(form.content), [form.content]);
  const preview = useMemo(() => sanitizePreview(form.content), [form.content]);

  const hasCover = Boolean(article?.cover_url) || coverChosen;
  const metaLength = form.metaDescription.trim().length;

  const checks = [
    { label: "Title added", ok: Boolean(form.title.trim()) },
    { label: "URL slug added", ok: Boolean(form.slug.trim()) },
    { label: "Excerpt is descriptive", ok: form.excerpt.trim().length >= 80 },
    { label: "At least 300 words", ok: words >= 300 },
    { label: "Cover image added", ok: hasCover },
    { label: "Category selected", ok: Boolean(form.category.trim()) },
    { label: "Meta description ready", ok: metaLength >= 120 && metaLength <= 170 },
    { label: "At least one source", ok: form.citations.some((c) => c.text.trim()) },
  ];
  const done = checks.filter((c) => c.ok).length;
  const readiness = Math.round((done / checks.length) * 100);
  const nextMissing = checks.find((c) => !c.ok)?.label;

  // Cmd/Ctrl+S saves, like every editor anyone already knows.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!busy) formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy]);

  // Don't let unsaved work disappear on a stray back button.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty && !busy) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);

  const insert = (before: string, after: string, placeholder: string) => {
    const textarea = contentRef.current;
    const start = textarea?.selectionStart ?? form.content.length;
    const end = textarea?.selectionEnd ?? start;
    const selected = form.content.slice(start, end) || placeholder;
    const next = `${form.content.slice(0, start)}${before}${selected}${after}${form.content.slice(end)}`;
    set("content", next);
    requestAnimationFrame(() => {
      textarea?.focus();
      const caret = start + before.length;
      textarea?.setSelectionRange(caret, caret + selected.length);
    });
  };

  const TOOLS: Array<[string, string, () => void]> = [
    ["H2", "Heading 2", () => insert("<h2>", "</h2>", "Section heading")],
    ["H3", "Heading 3", () => insert("<h3>", "</h3>", "Subheading")],
    ["B", "Bold", () => insert("<strong>", "</strong>", "bold text")],
    ["I", "Italic", () => insert("<em>", "</em>", "italic text")],
    ["🔗", "Link", () => insert('<a href="https://">', "</a>", "link text")],
    ["•", "List", () => insert("<ul>\n  <li>", "</li>\n</ul>", "List item")],
    ["❝", "Quote", () => insert("<blockquote>", "</blockquote>", "Quoted text")],
    ["▦", "Table", () => insert("<table>\n  <thead><tr><th scope=\"col\">", "</th><th scope=\"col\">Value</th></tr></thead>\n  <tbody><tr><td>Row</td><td>Figure</td></tr></tbody>\n</table>", "Column")],
  ];

  const faqSerialised = form.faq.filter((r) => r.question.trim() && r.answer.trim())
    .map((r) => `${r.question.trim()} | ${r.answer.trim()}`).join("\n");
  const citeSerialised = form.citations.filter((r) => r.text.trim())
    .map((r) => `${r.text.trim()} | ${r.url.trim()}`).join("\n");

  const live = article?.status === "published";

  return (
    <main className="admin-main ed">
      <Form method="post" encType="multipart/form-data" ref={formRef} className="ed-form">
        <input type="hidden" name="cover_media_id" value={article?.cover_media_id || ""} />
        <input type="hidden" name="published_at" value={article?.published_at || ""} />
        <input type="hidden" name="faq" value={faqSerialised} />
        <input type="hidden" name="citations" value={citeSerialised} />

        <header className="ed-bar">
          <div className="ed-bar-lead">
            <Link className="ed-back" to="/admin/articles" aria-label="All articles">←</Link>
            <div>
              <b>{article ? "Article editor" : "New article"}</b>
              <span>{form.title || "Untitled article"}</span>
            </div>
          </div>

          <div className="ed-bar-ready">
            <div className="ed-bar-ready-top">
              <span>Publishing readiness</span>
              <b className={readiness === 100 ? "is-done" : undefined}>{readiness}%</b>
            </div>
            <div className="ed-progress"><div className={readiness === 100 ? "is-done" : undefined} style={{ width: `${readiness}%` }} /></div>
            <small>{nextMissing ? `Next: ${nextMissing}` : "Ready to publish"}</small>
          </div>

          <div className="ed-bar-actions">
            {live ? <a className="ed-viewlive" href={`/articles/${article.slug}`} target="_blank" rel="noreferrer">View live</a> : null}
            <select name="status" value={form.status} onChange={(event) => set("status", event.target.value)} aria-label="Status">
              <option value="draft">Draft</option>
              <option value="review">Ready for review</option>
              {staff.role === "admin" ? <option value="published">Published</option> : null}
              {staff.role === "admin" ? <option value="archived">Archived</option> : null}
            </select>
            <button className={`admin-primary ed-save${dirty ? "" : " is-saved"}`} name="intent" value="save" disabled={busy}>
              {busy ? "Saving…" : dirty ? "Save article" : "Saved"}
            </button>
          </div>
        </header>

        {actionData?.error ? <div className="admin-alert" role="alert">{actionData.error}</div> : null}

        <div className="ed-grid">
          <div className="ed-col">
            <section className="ed-card ed-card-warm">
              <div className="ed-card-head"><p className="admin-eyebrow">Article essentials</p><h2>Headline and summary</h2></div>
              <div className="ed-card-body">
                <div className="admin-field">
                  <label htmlFor="ed-title">Title</label>
                  <input id="ed-title" name="title" required value={form.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      setForm((c) => ({ ...c, title, slug: slugTouched ? c.slug : slugify(title) }));
                    }} />
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-slug">URL slug</label>
                  <input id="ed-slug" name="slug" value={form.slug}
                    onChange={(event) => { setSlugTouched(true); set("slug", slugify(event.target.value)); }} />
                  <small className="ed-hint">{SITE}/articles/{form.slug || "article-slug"}</small>
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-excerpt">Excerpt</label>
                  <textarea id="ed-excerpt" name="excerpt" rows={3} value={form.excerpt} onChange={(event) => set("excerpt", event.target.value)} />
                  <small className="ed-hint"><Counter value={form.excerpt.length} ideal={[80, 240]} /> · aim for a useful two-sentence summary</small>
                </div>
              </div>
            </section>

            <section className="ed-card ed-card-cool">
              <div className="ed-card-head">
                <div><p className="admin-eyebrow">Article body</p><h2>Write and preview</h2></div>
                <span className="ed-wordcount">{words.toLocaleString("en-GB")} words · {calculated} min read</span>
              </div>

              <div className="ed-toolbar">
                <div className="ed-tools">
                  {TOOLS.map(([glyph, label, run]) => (
                    <button key={label} type="button" title={label} aria-label={label} onClick={run}>{glyph}</button>
                  ))}
                </div>
                <div className="ed-modes" role="group" aria-label="Editor mode">
                  {(["write", "split", "preview"] as EditorMode[]).map((value) => (
                    <button key={value} type="button" className={mode === value ? "is-active" : undefined} onClick={() => setMode(value)}>
                      {value[0].toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`ed-panes ed-panes-${mode}`}>
                {mode !== "preview" ? (
                  <textarea ref={contentRef} className="ed-code" name="content_html" required value={form.content}
                    onChange={(event) => set("content", event.target.value)}
                    placeholder={"<h2>Section heading</h2>\n<p>Start writing…</p>"} />
                ) : <input type="hidden" name="content_html" value={form.content} />}
                {mode !== "write" ? (
                  <div className="ed-preview">
                    {form.content.trim()
                      ? <div className="article-body" dangerouslySetInnerHTML={{ __html: preview.html }} />
                      : <p className="admin-muted">Nothing to preview yet.</p>}
                  </div>
                ) : null}
              </div>

              {preview.stripped.length ? (
                <p className="ed-stripped">
                  Not allowed in an article and removed on save: {preview.stripped.map((t) => `<${t}>`).join(", ")}
                </p>
              ) : null}
            </section>

            <section className={`ed-card ed-card-cool ed-accordion${openFaq ? " is-open" : ""}`}>
              <button type="button" className="ed-accordion-head" onClick={() => setOpenFaq((v) => !v)} aria-expanded={openFaq}>
                <div><h2>Frequently asked questions</h2><span>{form.faq.length} item{form.faq.length === 1 ? "" : "s"} · drives the FAQ schema</span></div>
                <i aria-hidden="true">{openFaq ? "▾" : "▸"}</i>
              </button>
              {openFaq ? (
                <div className="ed-card-body">
                  {form.faq.map((row, index) => (
                    <div className="ed-row" key={index}>
                      <div className="admin-field">
                        <label>Question {index + 1}</label>
                        <input value={row.question} onChange={(event) => {
                          const next = [...form.faq]; next[index] = { ...next[index], question: event.target.value }; set("faq", next);
                        }} />
                      </div>
                      <div className="admin-field">
                        <label>Answer</label>
                        <textarea rows={3} value={row.answer} onChange={(event) => {
                          const next = [...form.faq]; next[index] = { ...next[index], answer: event.target.value }; set("faq", next);
                        }} />
                      </div>
                      <button type="button" className="ed-remove" title="Remove question"
                        onClick={() => set("faq", form.faq.filter((_, i) => i !== index))}>✕</button>
                    </div>
                  ))}
                  <button type="button" className="admin-ghost" onClick={() => set("faq", [...form.faq, { question: "", answer: "" }])}>+ Add question</button>
                </div>
              ) : null}
            </section>

            <section className={`ed-card ed-card-good ed-accordion${openSources ? " is-open" : ""}`}>
              <button type="button" className="ed-accordion-head" onClick={() => setOpenSources((v) => !v)} aria-expanded={openSources}>
                <div><h2>Sources and citations</h2><span>{form.citations.length} source{form.citations.length === 1 ? "" : "s"} · every claim carries one</span></div>
                <i aria-hidden="true">{openSources ? "▾" : "▸"}</i>
              </button>
              {openSources ? (
                <div className="ed-card-body">
                  {form.citations.map((row, index) => (
                    <div className="ed-row ed-row-inline" key={index}>
                      <div className="admin-field">
                        <label>Source {index + 1}</label>
                        <input placeholder="NHBF, State of the Industry, March 2026" value={row.text} onChange={(event) => {
                          const next = [...form.citations]; next[index] = { ...next[index], text: event.target.value }; set("citations", next);
                        }} />
                      </div>
                      <div className="admin-field">
                        <label>URL</label>
                        <input placeholder="https://" value={row.url} onChange={(event) => {
                          const next = [...form.citations]; next[index] = { ...next[index], url: event.target.value }; set("citations", next);
                        }} />
                      </div>
                      <button type="button" className="ed-remove" title="Remove source"
                        onClick={() => set("citations", form.citations.filter((_, i) => i !== index))}>✕</button>
                    </div>
                  ))}
                  <button type="button" className="admin-ghost" onClick={() => set("citations", [...form.citations, { text: "", url: "" }])}>+ Add source</button>
                </div>
              ) : null}
            </section>
          </div>

          <aside className="ed-side">
            <section className="ed-card ed-card-warm">
              <div className="ed-card-head">
                <div><p className="admin-eyebrow">Quality control</p><h2>Publishing readiness</h2></div>
                <span className={`ed-readypill${readiness === 100 ? " is-done" : ""}`}>{readiness}%</span>
              </div>
              <div className="ed-card-body">
                <div className="ed-progress ed-progress-lg"><div className={readiness === 100 ? "is-done" : undefined} style={{ width: `${readiness}%` }} /></div>
                {nextMissing ? <p className="ed-next">Next: {nextMissing}</p> : null}
                <ul className="ed-checks">
                  {checks.map((check) => (
                    <li key={check.label} className={check.ok ? "is-ok" : undefined}>
                      <i aria-hidden="true">{check.ok ? "✓" : "○"}</i> {check.label}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="ed-card ed-card-cool">
              <div className="ed-card-head"><div><p className="admin-eyebrow">Article media</p><h2>Cover image</h2></div></div>
              <div className="ed-card-body">
                {article?.cover_url ? (
                  <a className="ed-cover" href={article.cover_url} target="_blank" rel="noreferrer">
                    <img src={article.cover_url} alt={form.coverAlt || ""} />
                    <span>View full size</span>
                  </a>
                ) : (
                  <div className="ed-cover ed-cover-empty">Add a cover image</div>
                )}
                <div className="admin-field">
                  <label htmlFor="ed-cover">{article?.cover_url ? "Replace image" : "Upload image"}</label>
                  <input id="ed-cover" type="file" name="cover" accept="image/avif,image/jpeg,image/png,image/webp"
                    onChange={(event) => setCoverChosen(Boolean(event.target.files?.length))} />
                  <small className="ed-hint">WebP or AVIF, about 1200px wide.</small>
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-cover-alt">Alternative text</label>
                  <input id="ed-cover-alt" name="cover_alt" value={form.coverAlt} onChange={(event) => set("coverAlt", event.target.value)} />
                  <small className="ed-hint">Describe the image, not the article.</small>
                </div>
              </div>
            </section>

            <section className="ed-card ed-card-cool">
              <div className="ed-card-head"><div><p className="admin-eyebrow">Organisation</p><h2>Publishing details</h2></div></div>
              <div className="ed-card-body">
                <div className="admin-field">
                  <label htmlFor="ed-category">Category</label>
                  <input id="ed-category" name="category" list="ed-categories" value={form.category} onChange={(event) => set("category", event.target.value)} />
                  <datalist id="ed-categories">
                    {(categories ?? []).map((name: string) => <option key={name} value={name} />)}
                  </datalist>
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-author">Author</label>
                  <input id="ed-author" name="author" list="ed-authors" value={form.author} onChange={(event) => set("author", event.target.value)} />
                  <datalist id="ed-authors">
                    {(authors ?? []).map((name: string) => <option key={name} value={name} />)}
                  </datalist>
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-tags">Tags</label>
                  <input id="ed-tags" name="tags" value={form.tagsCsv} onChange={(event) => set("tagsCsv", event.target.value)} placeholder="costs, pricing, margin" />
                  <small className="ed-hint">Separate tags with commas.</small>
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-read">Reading time (minutes)</label>
                  <input id="ed-read" type="number" min="1" max="180" name="reading_time_minutes" value={form.readingTime} onChange={(event) => set("readingTime", event.target.value)} />
                  <small className="ed-hint">Calculated from the body: {calculated} min</small>
                </div>
                <label className="admin-check"><input type="checkbox" name="is_featured" checked={form.featured} onChange={(event) => set("featured", event.target.checked)} /> Featured</label>
                <label className="admin-check"><input type="checkbox" name="noindex" checked={form.noindex} onChange={(event) => set("noindex", event.target.checked)} /> Hide from search engines</label>
              </div>
            </section>

            <section className="ed-card ed-card-good">
              <div className="ed-card-head"><div><p className="admin-eyebrow">Search appearance</p><h2>SEO</h2></div></div>
              <div className="ed-card-body">
                <div className="ed-serp">
                  <b>{form.seoTitle || form.title || "Article title"}</b>
                  <span>{SITE}/articles/{form.slug || "article"}</span>
                  <p>{form.metaDescription || form.excerpt || "Add a meta description to control how this article appears in search."}</p>
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-seo-title">SEO title</label>
                  <input id="ed-seo-title" name="seo_title" maxLength={120} value={form.seoTitle} onChange={(event) => set("seoTitle", event.target.value)} />
                  <small className="ed-hint"><Counter value={form.seoTitle.length} ideal={[35, 60]} max={120} /></small>
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-meta">Meta description</label>
                  <textarea id="ed-meta" name="meta_description" rows={3} maxLength={320} value={form.metaDescription} onChange={(event) => set("metaDescription", event.target.value)} />
                  <small className="ed-hint"><Counter value={form.metaDescription.length} ideal={[120, 170]} max={320} /></small>
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-og-title">Social title</label>
                  <input id="ed-og-title" name="og_title" value={form.ogTitle} onChange={(event) => set("ogTitle", event.target.value)} />
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-og-desc">Social description</label>
                  <textarea id="ed-og-desc" name="og_description" rows={2} value={form.ogDescription} onChange={(event) => set("ogDescription", event.target.value)} />
                </div>
                <div className="admin-field">
                  <label htmlFor="ed-keywords">Keywords</label>
                  <input id="ed-keywords" name="keywords" value={form.keywordsCsv} onChange={(event) => set("keywordsCsv", event.target.value)} />
                  <small className="ed-hint">Separate keywords with commas.</small>
                </div>
              </div>
            </section>

            {article && staff.role === "admin" ? (
              <button className="admin-danger ed-delete" name="intent" value="delete" formNoValidate
                onClick={(event) => { if (!confirm("Delete this article permanently?")) event.preventDefault(); }}>
                Delete article
              </button>
            ) : null}
          </aside>
        </div>
      </Form>

      {revisions?.length ? (
        <section className="admin-revisions">
          <h2>Revision history</h2>
          <ul>
            {revisions.map((revision: any) => (
              <li key={revision.id}>
                <span>Revision {revision.revision_number} · {revision.operation} · {new Date(revision.created_at).toLocaleString("en-GB")}</span>
                <Form method="post">
                  <button name="intent" value={`restore:${revision.id}`}
                    onClick={(event) => { if (!confirm(`Restore revision ${revision.revision_number}? The current version will remain in history.`)) event.preventDefault(); }}>
                    Restore
                  </button>
                </Form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
