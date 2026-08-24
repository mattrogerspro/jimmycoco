# email/tools — email validation and legacy utilities

**The repo is the single source of truth.** The UK and U.S. launch campaigns are rendered by the application and sent as complete HTML. They do not use Resend Templates.

## Files

- `sync-resend.py` — legacy manual utility for older campaigns that still have an approved Resend Template delivery path. It must not be used for the UK/U.S. launch campaigns.
- `install-hooks.sh` — one-time: activates the `.githooks/pre-push` hook.
- `../../.githooks/pre-push` — runs the read-only application template contract validation on every `git push`.

## How a campaign opts in

Add a `resend.json` next to the campaign's `emails/` folder. Example
(`email/campaigns/uk-salon-onboarding/resend.json`):

```json
{
  "campaign": "uk-salon-onboarding",
  "publish": true,
  "templates": [
    { "file": "emails/1-welcome.html", "alias": "uk-onboarding-1-welcome",
      "name": "UK Onboarding 1 — Welcome", "subject": "Your clients already know this name" }
  ]
}
```

Each template needs `file`, `alias`, and `name`; `subject` is recommended.
The `alias` is the stable Resend key — keep it fixed so updates land on the
same template instead of creating duplicates. Only reserved variables
(`FIRST_NAME`, `LAST_NAME`, `EMAIL`, `RESEND_UNSUBSCRIBE_URL`) are auto-provided;
never declare them. A folder with **no** `resend.json` is left untouched
(e.g. `uk-salon-stockist/` is not synced).

## Daily use

```bash
# validate manifests + files, no network, no key:
python3 email/tools/sync-resend.py --check

# see what would change, write nothing:
RESEND_API_KEY=re_xxx python3 email/tools/sync-resend.py --dry-run

# do it:
RESEND_API_KEY=re_xxx python3 email/tools/sync-resend.py

# one campaign only:
RESEND_API_KEY=re_xxx python3 email/tools/sync-resend.py --campaign uk-salon-onboarding
```

## Read-only validation on push (one-time setup)

```bash
sh email/tools/install-hooks.sh          # activate .githooks
```

After that, every `git push` runs `npm run templates:check`. The hook performs no network calls and never writes to Resend.

## Notes

- The API key is only ever read from `RESEND_API_KEY` and sent in the auth
  header — it is never written to the repo or printed.
- Templates carry no default `from`; set the sender at send time
  (e.g. `Sunless by Jimmy Coco <pro@email.jimmycoco.pro>`).
- Store/CTA links stay on `jimmycoco.co.uk`; only hosted **images** use
  `jimmycoco.email/email-assets/…`.
- To bring the AU / UAE campaigns under the same sync, add a `resend.json` to
  those folders with their existing template aliases.
