# emails/

The **sendable** HTML for this campaign — one file per email, numbered by send order:

```
1-<slug>.html
2-<slug>.html
…
```

Rules:
- Number matches the email's position in `../sequence.md`.
- A **plain-text-only** email has no file here — its copy still lives in `sequence.md`.
- Email-safe HTML only (table layout, inline CSS, web-safe fonts) so it renders everywhere.

Reference material (playbooks, guides, PDFs) does **not** go here — that belongs in `../docs/`.
