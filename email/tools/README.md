# email/tools — keeping the repo and Resend in sync

**The repo is the single source of truth.** You edit the campaign HTML here; a
small script pushes it to Resend so the two never drift.

## Files

- `sync-resend.py` — reads every `email/campaigns/<campaign>/resend.json` and
  creates/updates + publishes each template in Resend from the repo's HTML.
  Idempotent: templates already matching Resend are skipped.
- `install-hooks.sh` — one-time: activates the `.githooks/pre-push` hook.
- `../../.githooks/pre-push` — runs the sync automatically on every `git push`.

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

## Auto-sync on push (one-time setup)

```bash
sh email/tools/install-hooks.sh          # activate .githooks
export RESEND_API_KEY=re_xxx             # add to ~/.zshrc to persist
```

After that, every `git push` syncs Resend first. If the key isn't set the push
still goes through (with a warning). Bypass a single push with
`SKIP_RESEND_SYNC=1 git push`.

## Notes

- The API key is only ever read from `RESEND_API_KEY` and sent in the auth
  header — it is never written to the repo or printed.
- Templates carry no default `from`; set the sender at send time
  (e.g. `Sunless by Jimmy Coco <pro@email.jimmycoco.pro>`).
- Store/CTA links stay on `jimmycoco.co.uk`; only hosted **images** use
  `jimmycoco.email/email-assets/…`.
- To bring the AU / UAE campaigns under the same sync, add a `resend.json` to
  those folders with their existing template aliases.
