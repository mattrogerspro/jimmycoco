#!/usr/bin/env python3
"""
sync-resend.py — make Resend match the repo (repo = single source of truth).

It scans every  email/campaigns/<campaign>/resend.json  manifest and, for each
template declared there, creates or updates the matching Resend template from
the repo's HTML file and publishes it. It is idempotent: a template whose live
HTML + subject already match the repo (and is already published) is skipped, so
running it repeatedly (e.g. on every git push) is cheap and only changes what
actually differs.

Nothing here ever prints or stores your API key. The key is read from the
RESEND_API_KEY environment variable and sent only in the Authorization header.

USAGE
  RESEND_API_KEY=re_xxx  python3 email/tools/sync-resend.py            # sync everything
  RESEND_API_KEY=re_xxx  python3 email/tools/sync-resend.py --dry-run  # show actions, write nothing
  python3 email/tools/sync-resend.py --check                           # validate manifests+files only (no network, no key)
  RESEND_API_KEY=re_xxx  python3 email/tools/sync-resend.py --campaign uk-salon-onboarding

EXIT CODES
  0  success (or --check/--dry-run passed)
  1  a sync/create/update/publish failed, or a manifest/file problem was found

Requires only Python 3.8+ (standard library — no pip install needed).
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

API_BASE = "https://api.resend.com"

# Resend auto-provides these; they must NOT be declared as custom variables.
RESERVED_VARS = {"FIRST_NAME", "LAST_NAME", "EMAIL", "UNSUBSCRIBE_URL",
                 "RESEND_UNSUBSCRIBE_URL", "contact", "this"}

# email/tools/sync-resend.py  ->  parents[1] is email/  ->  campaigns dir
CAMPAIGNS_DIR = Path(__file__).resolve().parents[1] / "campaigns"


class SyncError(Exception):
    pass


# ----------------------------------------------------------------------------- HTTP
def _request(method, path, api_key, body=None):
    url = API_BASE + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "Bearer " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8") or "{}"
            return resp.status, json.loads(raw)
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")
        try:
            detail = json.dumps(json.loads(detail))
        except Exception:
            pass
        raise SyncError(f"{method} {path} -> HTTP {e.code}: {detail}")
    except urllib.error.URLError as e:
        raise SyncError(f"{method} {path} -> network error: {e.reason}")


def list_templates(api_key):
    """Return {alias: template_dict} across all pages."""
    by_alias = {}
    after = None
    for _ in range(50):  # hard page cap
        path = "/templates?limit=100" + (f"&after={after}" if after else "")
        _, payload = _request("GET", path, api_key)
        items = payload.get("data", payload) if isinstance(payload, dict) else payload
        if not isinstance(items, list) or not items:
            break
        for t in items:
            alias = t.get("alias")
            if alias:
                by_alias[alias] = t
        if len(items) < 100:
            break
        after = items[-1].get("id")
        if not after:
            break
    return by_alias


def get_template(id_or_alias, api_key):
    _, payload = _request("GET", f"/templates/{id_or_alias}", api_key)
    return payload


def create_template(spec, api_key):
    body = {"name": spec["name"], "html": spec["html"]}
    for k in ("alias", "subject", "from", "reply_to", "text"):
        if spec.get(k):
            body[k] = spec[k]
    if spec.get("variables"):
        body["variables"] = spec["variables"]
    _, payload = _request("POST", "/templates", api_key, body)
    return payload


def update_template(tid, spec, api_key):
    body = {"name": spec["name"], "subject": spec.get("subject", ""), "html": spec["html"]}
    if spec.get("variables") is not None:
        body["variables"] = spec["variables"]
    _, payload = _request("PATCH", f"/templates/{tid}", api_key, body)
    return payload


def publish_template(id_or_alias, api_key):
    _request("POST", f"/templates/{id_or_alias}/publish", api_key)


# ----------------------------------------------------------------------------- manifests
def find_manifests(campaign_filter=None):
    if not CAMPAIGNS_DIR.is_dir():
        raise SyncError(f"campaigns dir not found: {CAMPAIGNS_DIR}")
    out = []
    for manifest in sorted(CAMPAIGNS_DIR.glob("*/resend.json")):
        if campaign_filter and manifest.parent.name != campaign_filter:
            continue
        out.append(manifest)
    return out


def load_manifest(manifest_path):
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception as e:
        raise SyncError(f"{manifest_path}: invalid JSON ({e})")
    templates = data.get("templates")
    if not isinstance(templates, list) or not templates:
        raise SyncError(f"{manifest_path}: no 'templates' array")
    default_publish = data.get("publish", True)
    specs = []
    for i, t in enumerate(templates):
        for req in ("file", "alias", "name"):
            if not t.get(req):
                raise SyncError(f"{manifest_path}: template #{i+1} missing '{req}'")
        html_path = (manifest_path.parent / t["file"]).resolve()
        if not html_path.is_file():
            raise SyncError(f"{manifest_path}: file not found -> {t['file']}")
        for v in (t.get("variables") or []):
            key = v.get("key", "")
            if key in RESERVED_VARS:
                raise SyncError(f"{manifest_path}: '{key}' is reserved and must not be declared")
        specs.append({
            "campaign": manifest_path.parent.name,
            "file": t["file"],
            "html_path": html_path,
            "alias": t["alias"],
            "name": t["name"],
            "subject": t.get("subject", ""),
            "from": t.get("from"),
            "reply_to": t.get("reply_to"),
            "variables": t.get("variables"),
            "publish": t.get("publish", default_publish),
        })
    return specs


# ----------------------------------------------------------------------------- main
def run(check=False, dry_run=False, campaign_filter=None):
    manifests = find_manifests(campaign_filter)
    if not manifests:
        where = f" for campaign '{campaign_filter}'" if campaign_filter else ""
        print(f"No resend.json manifests found{where} under {CAMPAIGNS_DIR}.")
        return 0

    all_specs = []
    for m in manifests:
        specs = load_manifest(m)
        for s in specs:
            s["html"] = s["html_path"].read_text(encoding="utf-8")
        all_specs.extend(specs)
        print(f"manifest: {m.parent.name}  ({len(specs)} template(s))")

    if check:
        print(f"\n[check] OK — {len(all_specs)} template(s) across "
              f"{len(manifests)} manifest(s); all files resolve, JSON valid.")
        return 0

    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    if not api_key:
        print("ERROR: RESEND_API_KEY is not set in the environment.", file=sys.stderr)
        return 1

    live = list_templates(api_key)
    created = updated = skipped = published = 0

    for s in all_specs:
        alias = s["alias"]
        tag = f"{s['campaign']}/{alias}"
        existing = live.get(alias)
        try:
            if existing is None:
                if dry_run:
                    print(f"  CREATE  {tag}")
                else:
                    res = create_template(s, api_key)
                    tid = res.get("id", alias)
                    if s["publish"]:
                        publish_template(tid, api_key); published += 1
                    print(f"  created {tag}")
                created += 1
            else:
                tid = existing.get("id", alias)
                current = get_template(tid, api_key)
                same = (current.get("html") == s["html"]
                        and (current.get("subject") or "") == (s["subject"] or "")
                        and current.get("status") == "published")
                if same:
                    print(f"  skip    {tag} (already in sync)")
                    skipped += 1
                    continue
                if dry_run:
                    print(f"  UPDATE  {tag}")
                else:
                    update_template(tid, s, api_key)
                    if s["publish"]:
                        publish_template(tid, api_key); published += 1
                    print(f"  updated {tag}")
                updated += 1
        except SyncError as e:
            print(f"  FAIL    {tag}: {e}", file=sys.stderr)
            return 1

    verb = "would " if dry_run else ""
    print(f"\nDone. {verb}created {created}, {verb}updated {updated}, "
          f"skipped {skipped}, published {published}.")
    return 0


def main():
    ap = argparse.ArgumentParser(description="Sync repo email templates to Resend.")
    ap.add_argument("--check", action="store_true",
                    help="validate manifests + files only (no network, no API key)")
    ap.add_argument("--dry-run", action="store_true",
                    help="show create/update/skip actions without writing to Resend")
    ap.add_argument("--campaign", metavar="NAME",
                    help="only sync this campaign folder name")
    args = ap.parse_args()
    try:
        sys.exit(run(check=args.check, dry_run=args.dry_run, campaign_filter=args.campaign))
    except SyncError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
