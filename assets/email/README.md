# Email Asset Derivatives

This folder contains email-ready derivatives of approved source assets. Source-of-truth originals remain under `assets/images/` and must not be overwritten.

## Structure

```text
assets/email/
├── product/
├── celebrity/
├── lifestyle/
├── proof/
└── campaign/
```

Create the relevant subfolder when adding the first derivative. Empty folders are not tracked by Git.

## Naming

Use:

```text
<asset-slug>-email-<width>x<height>.<ext>
<asset-slug>-email-mobile-<width>x<height>.<ext>
```

Examples:

```text
product/sunset-professional-email-600x400.jpg
product/sunset-professional-email-mobile-480x480.jpg
```

## Rules

- Never replace or rename the approved source asset solely for email.
- Do not alter product labels, packaging, colour, skin tone, faces or tanning results.
- Record every derivative in `email/06-assets/asset-manifest.json`.
- Production derivatives need stable public HTTPS URLs; repository paths alone do not work in recipient email clients.
- Prefer JPEG for photographic email imagery and PNG only when transparency or hard-edged graphics require it.
- Keep desktop images close to their rendered size and optimise file weight before approval.
- Every derivative requires dimensions, alt text, rights, market/channel/purpose permissions and approval provenance.
