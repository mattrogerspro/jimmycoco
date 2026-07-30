import html,pathlib
BASE=pathlib.Path(__file__).parent
e=(BASE/"index-email.html").read_text(encoding="utf-8")
srcdoc=html.escape(e,quote=True)
SUBJECT="why your tan goes patchy on day three"
PRE="It’s almost never the tan itself. Here’s what’s actually going on."
shell=f"""<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview &mdash; Monday newsletter, 3 August 2026</title>
<style>
:root{{--ink:#2C2A29;--muted:#6F6A66;--line:#DED8D4;--page:#F4F1EF;--bronze:#9B5F44;}}
*{{box-sizing:border-box;}}
body{{margin:0;background:var(--page);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;}}
header{{background:#fff;border-bottom:1px solid var(--line);padding:22px 28px;}}
header h1{{margin:0 0 4px;font-size:17px;font-weight:600;letter-spacing:-.2px;}}
header p{{margin:0;font-size:13px;color:var(--muted);}}
.status{{display:inline-block;margin-top:10px;padding:4px 10px;border-radius:3px;background:#FBEDE6;color:#9B5F44;font-size:11px;font-weight:700;letter-spacing:1px;}}
.wrap{{max-width:1180px;margin:0 auto;padding:26px 24px 70px;}}
.inbox{{background:#fff;border:1px solid var(--line);border-radius:6px;padding:16px 18px;margin-bottom:26px;max-width:760px;}}
.inbox .lbl{{font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;}}
.inbox .from{{font-size:14px;font-weight:700;}}
.inbox .subj{{font-size:14px;font-weight:600;margin-top:3px;}}
.inbox .pre{{font-size:14px;color:var(--muted);margin-top:2px;}}
.inbox .meta{{font-size:11px;color:var(--muted);margin-top:10px;padding-top:10px;border-top:1px solid var(--line);}}
.views{{display:flex;gap:34px;align-items:flex-start;flex-wrap:wrap;}}
.view h2{{font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:var(--muted);margin:0 0 10px;font-weight:600;}}
.frame{{background:#fff;border:1px solid var(--line);border-radius:6px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05);}}
iframe{{display:block;border:0;background:#EBE7E6;}}
.desktop iframe{{width:600px;height:1650px;}}
.mobile .frame{{border-radius:26px;padding:10px;background:#1C1A19;border-color:#1C1A19;}}
.mobile iframe{{width:375px;height:1500px;border-radius:16px;}}
.notes{{margin-top:40px;background:#fff;border:1px solid var(--line);border-radius:6px;padding:22px 24px;max-width:760px;}}
.notes h3{{margin:0 0 12px;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);}}
.notes ol{{margin:0;padding-left:20px;font-size:14px;line-height:1.75;}}
.notes li b{{color:var(--bronze);}}
@media (max-width:1120px){{.views{{flex-direction:column;}}}}
</style></head><body>
<header>
<h1>Monday newsletter &mdash; Sunless by Jimmy Coco</h1>
<p>Send target: Monday 3 August 2026, 10:00&ndash;11:00 UK &middot; Segment A &mdash; Engaged (V4mDxv), UK-filtered</p>
<span class="status">DRAFT &mdash; NOT APPROVED FOR SEND</span>
</header>
<div class="wrap">
<div class="inbox">
<div class="lbl">How it lands in the inbox</div>
<div class="from">Jimmy Coco</div>
<div class="subj">{html.escape(SUBJECT)}</div>
<div class="pre">{html.escape(PRE)}</div>
<div class="meta">Subject is {len(SUBJECT)} characters (mobile truncates around 42) &middot; no %, no &ldquo;OFF&rdquo;, no caps, no exclamation marks</div>
</div>
<div class="views">
<div class="view desktop"><h2>Desktop &mdash; 600px</h2><div class="frame"><iframe title="Desktop preview" srcdoc="{srcdoc}"></iframe></div></div>
<div class="view mobile"><h2>Mobile &mdash; 375px</h2><div class="frame"><iframe title="Mobile preview" srcdoc="{srcdoc}"></iframe></div></div>
</div>
<div class="notes">
<h3>The seven click targets</h3>
<ol>
<li><b>Live-text nav</b> &mdash; Shop / The Glow Edit / Tan Guide, above the fold, works with images off</li>
<li><b>&ldquo;Here&rsquo;s how I fix all three&rdquo;</b> &mdash; the first body link, inside the opening paragraph</li>
<li><b>&ldquo;What I prep clients with&rdquo;</b> &mdash; end of mistake one</li>
<li><b>&ldquo;Where to barrier-cream, exactly&rdquo;</b> &mdash; end of mistake two</li>
<li><b>&ldquo;Keep face and body matched&rdquo;</b> &mdash; end of mistake three</li>
<li><b>SEE THE GLOW EDIT</b> button, plus <b>&ldquo;browse everything else&rdquo;</b> text link underneath it</li>
<li><b>&ldquo;Just reply to this email&rdquo;</b> &mdash; a reply is the strongest engagement signal you can buy</li>
</ol>
</div>
</div></body></html>
"""
(BASE/"index.html").write_text(shell,encoding="utf-8")
print("ok",len(shell))
