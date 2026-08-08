#!/usr/bin/env python3
"""UK salon onboarding sequence (7 emails) in the UK-stockist rich style.
Hero product = the professional spray-tan line (Sunset 1L). Take-home retail
range is SECONDARY only. Self-contained (no MailerLite). Images hosted at
ASSET_BASE. Emits template/ (with {{{RESEND_UNSUBSCRIBE_URL}}}) and sent/
(substituted) HTML."""
import os

ASSET_BASE = "https://jimmycoco.email/email-assets/uk-stockist/"   # <-- deploy the delivered image folder here (one-line change if hosted elsewhere)
LOGO_URL   = "https://jimmycoco.email/email-assets/logo.webp"
PRO_URL   = "https://jimmycoco.co.uk/pages/why-choose-pro-professional"
PRO_EMAIL = "pro@jimmycoco.co.uk"

# palette
BG="#e7dccd"; CARD="#f4ebe0"; PANEL="#efe6d9"; DARK="#1c1612"
BRZ="#b06a3a"; BTN="#b97544"; DEEP="#7d4422"; INK="#2a241f"; MUT="#4a423a"; FAINT="#8a8076"; LIGHT="#f4ebe0"
SERIF="'Playfair Display',Georgia,'Times New Roman',serif"
SANS="Arial,Helvetica,sans-serif"

def img(name): return ASSET_BASE+name

# ---- section renderers (each returns a <tr> row of the 600px container) ----
def s_header():
    return (f'<tr><td align="center" style="background:{CARD};padding:22px 36px 14px 36px;" class="pad-x">'
            f'<a href="https://jimmycoco.co.uk" style="display:inline-block;text-decoration:none;">'
            f'<img src="{LOGO_URL}" width="240" height="70" alt="Sunless by Jimmy Coco" '
            f'style="display:block;width:240px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;"></a>'
            f'</td></tr>')

def s_hero(name, alt):
    return (f'<tr><td style="background:{CARD};font-size:0;line-height:0;"><img src="{img(name)}" width="600" alt="{alt}" '
            f'style="width:100%;max-width:600px;height:auto;display:block;border:0;"></td></tr>')

def s_intro(eyebrow, headline):
    return (f'<tr><td style="background:{CARD};padding:34px 36px 6px 36px;" class="pad-x">'
            f'<p class="sans" style="margin:0 0 14px 0;font-family:{SANS};font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:{BRZ};font-weight:700;">{eyebrow}</p>'
            f'<h1 class="serif h1" style="margin:0;font-family:{SERIF};font-weight:700;font-size:33px;line-height:38px;color:{DARK};letter-spacing:-0.3px;">{headline}</h1>'
            f'</td></tr>')

def s_features(items):
    cells=""
    for it in items:
        cells+=(f'<td class="feat-col" width="25%" valign="top" align="center" style="padding:14px 8px;">'
                f'<p class="sans" style="margin:0;font-family:{SANS};font-size:12.5px;line-height:17px;color:{LIGHT};font-weight:700;letter-spacing:0.4px;text-transform:uppercase;">{it}</p></td>')
    return (f'<tr><td style="background:{DARK};padding:14px 16px;" class="pad-x">'
            f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>{cells}</tr></table></td></tr>')

def s_para(html_list):
    ps="".join(f'<p class="sans" style="margin:0 0 16px 0;font-family:{SANS};font-size:16.5px;line-height:26px;color:{INK};">{h}</p>' for h in html_list)
    return f'<tr><td style="background:{CARD};padding:22px 36px 8px 36px;" class="pad-x">{ps}</td></tr>'

def s_heading(text):
    return (f'<tr><td style="background:{CARD};padding:26px 34px 4px 34px;" class="pad-x" align="center">'
            f'<p class="serif" style="margin:0;font-family:{SERIF};font-size:25px;line-height:31px;letter-spacing:0.5px;color:{DEEP};font-weight:700;text-transform:uppercase;">{text}</p></td></tr>')

def s_benefits(items):  # items = (label, desc)
    rows=""
    for i,(label,desc) in enumerate(items):
        top = "" if i==0 else f'border-top:1px solid #e2d2bd;'
        rows+=(f'<tr><td style="padding:15px 0 15px 0;{top}" class="sans">'
               f'<span style="color:{BTN};font-size:17px;font-weight:700;">&#10003;</span>&nbsp;&nbsp;'
               f'<span style="font-family:{SANS};font-size:16px;font-weight:700;color:{DARK};">{label}</span>'
               f'<span style="font-family:{SANS};font-size:16px;color:{MUT};"> &mdash; {desc}</span></td></tr>')
    return (f'<tr><td style="background:{CARD};padding:12px 36px 14px 36px;" class="pad-x">'
            f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">{rows}</table></td></tr>')

def s_quote(text, by):
    return (f'<tr><td style="background:{PANEL};padding:34px 40px;" class="pad-x" align="center">'
            f'<p class="serif" style="margin:0 0 12px 0;font-family:{SERIF};font-size:20px;line-height:31px;color:#3a322b;font-style:italic;">&ldquo;{text}&rdquo;</p>'
            f'<p class="sans" style="margin:0;font-family:{SANS};font-size:13px;letter-spacing:2px;text-transform:uppercase;color:{BRZ};font-weight:700;">{by}</p></td></tr>')

def s_cta(label, href, subnote=None):
    sub = f'<p class="sans" style="margin:14px 0 0 0;font-family:{SANS};font-size:13px;color:{DEEP};font-weight:700;letter-spacing:0.4px;">{subnote}</p>' if subnote else ""
    return (f'<tr><td style="background:{PANEL};padding:30px 28px 34px 28px;" class="pad-x" align="center">'
            f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" bgcolor="{BTN}" style="border-radius:8px;">'
            f'<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{href}" style="height:56px;v-text-anchor:middle;width:320px;" arcsize="14%" stroke="f" fillcolor="{BTN}"><w:anchorlock/><center style="color:#ffffff;font-family:Georgia,serif;font-size:19px;font-weight:bold;">{label}</center></v:roundrect><![endif]-->'
            f'<a href="{href}" class="serif" style="display:inline-block;padding:17px 46px;font-family:{SERIF};font-size:19px;font-weight:700;color:#ffffff;border-radius:8px;background:{BTN};mso-hide:all;">{label}</a>'
            f'</td></tr></table>{sub}</td></tr>')

def s_pricenote(text):
    return (f'<tr><td style="background:{CARD};padding:6px 36px 26px 36px;" class="pad-x" align="center">'
            f'<p class="sans" style="margin:0;font-family:{SANS};font-size:14px;color:{DEEP};font-weight:700;letter-spacing:0.6px;">{text}</p></td></tr>')

def s_secondary(img_name, title, body, cta_label, cta_href):
    # SECONDARY retail block — visually lighter, clearly a side note
    thumb = (f'<td width="150" valign="top" class="stack" style="padding:0 18px 0 0;"><img src="{img(img_name)}" width="150" alt="{title}" '
             f'style="width:150px;max-width:150px;height:auto;display:block;border:0;border-radius:8px;"></td>') if img_name else ""
    return (f'<tr><td style="background:{CARD};padding:6px 36px 30px 36px;" class="pad-x">'
            f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{PANEL};border-radius:10px;"><tr><td style="padding:22px 24px;">'
            f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>{thumb}'
            f'<td valign="top" class="stack"><p class="sans" style="margin:0 0 6px 0;font-family:{SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:{BRZ};font-weight:700;">Optional second revenue line</p>'
            f'<p class="serif" style="margin:0 0 8px 0;font-family:{SERIF};font-size:19px;line-height:24px;color:{DARK};font-weight:700;">{title}</p>'
            f'<p class="sans" style="margin:0 0 12px 0;font-family:{SANS};font-size:15px;line-height:22px;color:{MUT};">{body}</p>'
            f'<a href="{cta_href}" class="sans" style="font-family:{SANS};font-size:14px;font-weight:700;color:{DEEP};text-decoration:underline;">{cta_label} &rsaquo;</a>'
            f'</td></tr></table></td></tr></table></td></tr>')

def s_trust(items):
    cells=""
    for it in items:
        cells+=(f'<td class="col-2" width="50%" align="center" style="padding:9px 6px;"><p class="sans" style="margin:0;font-family:{SANS};font-size:12.5px;line-height:16px;color:#cdbfae;font-weight:700;letter-spacing:0.5px;">{it}</p></td>')
    rows="".join(f'<tr>{cells[i:i+len(cells)//2]}</tr>' for i in [0]) if False else ""
    # simple 2x2
    a,b,c,d=items
    return (f'<tr><td style="background:{DARK};padding:22px 30px;" class="pad-x">'
            f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">'
            f'<tr><td class="col-2" width="50%" align="center" style="padding:8px 6px;"><p class="sans" style="margin:0;font-family:{SANS};font-size:12.5px;color:#cdbfae;font-weight:700;letter-spacing:0.5px;">{a}</p></td>'
            f'<td class="col-2" width="50%" align="center" style="padding:8px 6px;"><p class="sans" style="margin:0;font-family:{SANS};font-size:12.5px;color:#cdbfae;font-weight:700;letter-spacing:0.5px;">{b}</p></td></tr>'
            f'<tr><td class="col-2" width="50%" align="center" style="padding:8px 6px;"><p class="sans" style="margin:0;font-family:{SANS};font-size:12.5px;color:#cdbfae;font-weight:700;letter-spacing:0.5px;">{c}</p></td>'
            f'<td class="col-2" width="50%" align="center" style="padding:8px 6px;"><p class="sans" style="margin:0;font-family:{SANS};font-size:12.5px;color:#cdbfae;font-weight:700;letter-spacing:0.5px;">{d}</p></td></tr>'
            f'</table></td></tr>')

def s_signoff():
    return (f'<tr><td style="background:{BTN};padding:13px 20px;" align="center"><a href="{PRO_URL}" class="serif" style="margin:0;font-family:{SERIF};color:{LIGHT};font-size:14px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">Jimmy Coco. The Celebrity Expert. The Professional Choice.</a></td></tr>')

def s_footer():
    return (f'<tr><td style="background:{BG};padding:20px 36px;" align="center"><p class="sans" style="margin:0;font-family:{SANS};font-size:11px;line-height:16px;color:{FAINT};">'
            f'Sunless by Jimmy Coco &bull; Professional Trade Enquiries &bull; <a href="mailto:{PRO_EMAIL}" style="color:{FAINT};">{PRO_EMAIL}</a><br>'
            f'You are receiving this professional-stockist invitation from Sunless by Jimmy Coco.<br>'
            f'<a href="{{{{{{RESEND_UNSUBSCRIBE_URL}}}}}}" style="color:{FAINT};text-decoration:underline;">Unsubscribe</a></p></td></tr>')

def page(title, preview, rows):
    style=(f"html,body{{margin:0!important;padding:0!important;width:100%!important}}"
           f"*{{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}}table,td{{mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse}}"
           f"img{{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block}}a{{text-decoration:none}}"
           f"@media only screen and (max-width:600px){{.container{{width:100%!important}}.pad-x{{padding-left:22px!important;padding-right:22px!important}}"
           f".h1{{font-size:30px!important;line-height:34px!important}}.feat-col{{display:inline-block!important;width:46%!important}}"
           f".col-2{{display:inline-block!important;width:46%!important}}.stack{{display:block!important;width:100%!important;box-sizing:border-box!important;padding-right:0!important}}}}")
    body="".join(rows)
    return (f'<!DOCTYPE html>\n<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">\n'
            f'<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n<meta http-equiv="X-UA-Compatible" content="IE=edge">\n<meta name="x-apple-disable-message-reformatting">\n'
            f'<title>{title}</title>\n<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->\n'
            f'<style>\n{style}\n</style>\n</head>\n<body style="margin:0;padding:0;background:{BG};">\n'
            f'<div style="display:none;font-size:1px;color:{BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">{preview}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>\n'
            f'<center style="width:100%;background:{BG};">\n<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{BG};"><tr><td align="center" style="padding:0;">\n'
            f'<table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background:{CARD};">\n'
            f'{body}\n</table>\n</td></tr></table>\n</center>\n</body>\n</html>')

PRIMARY="Request your sample kit"
JQUOTE="I have spent over 20 years perfecting the art of the tan. This is my professional formula &mdash; created for artists and salons that care about believable colour and a polished, camera-ready result."

EMAILS=[
 dict(slug="1-welcome", alias="uk-onboarding-1-welcome",
   subject="Your clients already know this name",
   preview="The celebrity spray tan, now for professional UK salons — start with a sample kit.",
   rows=lambda:[s_header(), s_hero("hero-kendall.jpg","The celebrity glow, made professional"),
     s_intro("A professional stockist invitation","Your clients already know this name."),
     s_features(["20+ Years Experience","Celebrity Tan Expert","Professional Formula","Made For Salons"]),
     s_para(["<strong>Sunless by Jimmy Coco</strong> is the professional spray-tan line from celebrity tanning expert Jimmy Coco &mdash; the believable, undertone-true colour behind red-carpet glow, now available to UK salons to use in the booth.",
             "Over the next few emails we&rsquo;ll walk you through the formula, the result and how the professional line earns its place in your salon. The simplest first step is a professional sample kit."]),
     s_heading("Why it belongs in your salon"),
     s_benefits([("Celebrity credibility","a premium name your clients already recognise."),
                 ("Premium positioning","present tanning as a luxury treatment, not a discount service."),
                 ("A professional formula","undertone-true colour built for the booth."),
                 ("Full trade support","trade pricing, training, marketing and dedicated stockist help.")]),
     s_cta(PRIMARY, PRO_URL, "£60 / 1 litre · professional sample kit · fast UK delivery"),
     s_signoff(), s_footer()]),

 dict(slug="2-the-formula", alias="uk-onboarding-2-the-formula",
   subject="The professional formula, in one litre",
   preview="Approximately 28 flawless tans per litre — undertone-true colour that never goes orange.",
   rows=lambda:[s_header(), s_hero("product-sunset.jpg","Sunset professional spray tan — 1 litre"),
     s_intro("The professional solution","Built for the booth."),
     s_para(["The <strong>Sunset professional solution</strong> is the heart of the line &mdash; a one-litre professional spray delivering <strong>approximately 28 full-body tans</strong>. Dark / Extra Dark at 10% DHA, undertone-true and buildable, with an even, believable fade.",
             "It&rsquo;s the same colour philosophy Jimmy is known for: warm and natural in daylight, never flat, never orange &mdash; a result you can confidently price as premium."]),
     s_heading("What makes it professional"),
     s_benefits([("Professional spray","engineered for a flawless, even full-body tan."),
                 ("1 litre · approx. 28 tans","salon-size value — maximum result from every drop."),
                 ("Controlled shade","Dark / Extra Dark, 10% DHA, buildable depth."),
                 ("Flawless fade","even and natural, with no orange turn.")]),
     s_cta(PRIMARY, PRO_URL, "Trial it on a real client before you commit."),
     s_pricenote("£60 FOR 1 LITRE · PROFESSIONAL GRADE · FAST UK DELIVERY"),
     s_signoff(), s_footer()]),

 dict(slug="3-the-glow", alias="uk-onboarding-3-the-glow",
   subject="The glow clients book again for",
   preview="Skincare-led, hydrating, and believable in daylight.",
   rows=lambda:[s_header(), s_hero("glow-hero.jpg","A believable, skincare-led glow"),
     s_intro("The result","A glow that looks real in daylight."),
     s_para(["The real test of a professional tan isn&rsquo;t the treatment-room mirror &mdash; it&rsquo;s how it reads afterwards, in daylight, photographs and evening light.",
             "The professional solution is <strong>skincare-led and hydrating</strong>, for colour that looks considered rather than obvious, fades evenly, and keeps clients coming back to <em>your</em> chair for it."]),
     s_hero("apply-brush.jpg","Professional application in the booth"),
     s_benefits([("Skincare-led","a professional, skin-loving formula."),
                 ("Believable","reads true in daylight, photos and evening light."),
                 ("Hydrating","comfortable wear and a smooth finish."),
                 ("Flawless fade","natural and even — no patchiness, no orange.")]),
     s_cta(PRIMARY, PRO_URL, "See the result on a client with a sample kit."),
     s_signoff(), s_footer()]),

 dict(slug="4-red-carpet", alias="uk-onboarding-4-red-carpet",
   subject="The tan behind the red carpet",
   preview="Camera-ready colour — now a professional service you can offer.",
   rows=lambda:[s_header(), s_hero("hero-kendall.jpg","Red-carpet colour, made professional"),
     s_intro("The celebrity standard","Red-carpet colour, made professional."),
     s_para(["Jimmy Coco built his name on colour that has to hold up under the harshest scrutiny there is &mdash; cameras, red carpets and the world&rsquo;s most photographed events.",
             "That same expertise is what sits inside the professional line: <strong>camera-ready, undertone-true colour</strong> &mdash; now a premium service your salon can deliver every day."]),
     s_quote(JQUOTE, "Jimmy Coco"),
     s_cta(PRIMARY, PRO_URL, "Bring the celebrity standard to your booth."),
     s_signoff(), s_footer()]),

 dict(slug="5-the-commercial-case", alias="uk-onboarding-5-the-commercial-case",
   subject="Why the professional line pays for itself",
   preview="A premium booth service — with an optional take-home line to extend it.",
   rows=lambda:[s_header(), s_hero("apply-brush.jpg","A premium booth service"),
     s_intro("The commercial case","A premium service, priced like one."),
     s_para(["In the booth, the professional solution lets you present tanning as a <strong>premium treatment</strong> &mdash; a recognisable name, a believable result, and a genuine reason to price above a standard tan.",
             "At <strong>£60 for a litre that delivers approximately 28 tans</strong>, the maths works firmly in your favour before you&rsquo;ve added a penny of premium to the service."]),
     s_benefits([("Premium service pricing","charge for a celebrity-quality result, not a commodity tan."),
                 ("Salon-size value","Approximately 28 tans per litre keeps your cost per treatment low."),
                 ("Repeat bookings","a believable, even fade brings clients back to your chair.")]),
     s_secondary("product-kit.jpg","Extend every tan at home","An optional take-home edit — the Self Tan Soufflé, the Face Brush and glow balm — lets clients maintain their colour and gives you a second, lighter revenue line. Entirely optional, and easy to add later.","Ask about the retail range", f"mailto:{PRO_EMAIL}?subject=Jimmy%20Coco%20retail%20range"),
     s_cta(PRIMARY, PRO_URL, "Start with the professional line — add retail if and when you want."),
     s_signoff(), s_footer()]),

 dict(slug="6-whats-included", alias="uk-onboarding-6-whats-included",
   subject="What a Jimmy Coco partnership includes",
   preview="Trade pricing, training, the shade guide and dedicated stockist support.",
   rows=lambda:[s_header(), s_hero("glow-hero.jpg","A supported professional partnership"),
     s_intro("Partner support","More than a professional solution."),
     s_para(["A premium product only works when your team knows how to present it, recommend it and deliver it consistently. Stocking Jimmy Coco is a <strong>supported partnership</strong>, not just a wholesale order."]),
     s_benefits([("Exclusive trade pricing","professional rates built for salon margins."),
                 ("Shade &amp; method training","get your team confident from day one."),
                 ("The Jimmy Coco shade guide","the reference behind every believable result."),
                 ("Marketing &amp; launch assets","everything you need to launch the service."),
                 ("Dedicated stockist support","a direct line for anything you need.")]),
     s_secondary("product-souffle.jpg","An optional retail edit","Alongside the professional service, a curated take-home range is available for salons that want a second revenue line at the till. Optional, and never a condition of stocking the professional line.","Ask about the retail range", f"mailto:{PRO_EMAIL}?subject=Jimmy%20Coco%20retail%20range"),
     s_cta(PRIMARY, PRO_URL, "Trial-first: start with a professional sample kit."),
     s_signoff(), s_footer()]),

 dict(slug="7-become-a-stockist", alias="uk-onboarding-7-become-a-stockist",
   subject="Ready to bring it to your salon?",
   preview="Start with a professional sample kit.",
   rows=lambda:[s_header(), s_hero("hero-kendall.jpg","Bring the celebrity tan to your salon"),
     s_intro("Become a stockist","Bring the celebrity tan to your salon."),
     s_para(["Join selected UK salons offering the professional spray-tan line your clients already know and trust. The simplest first step is a <strong>professional sample kit</strong> &mdash; trial it on a client and judge the result for yourself."]),
     s_heading("Your stockist package"),
     s_benefits([("Exclusive trade pricing","professional rates for the booth."),
                 ("Professional training","shade, method and confidence."),
                 ("Marketing support","launch the service properly."),
                 ("Dedicated stockist support","we&rsquo;re with you after the first order.")]),
     s_cta(PRIMARY, PRO_URL, f"Or email trade enquiries to {PRO_EMAIL}"),
     s_trust(["FAST UK DELIVERY","PROFESSIONAL GRADE","TRUSTED BY 1000+ PROS","MADE FOR RESULTS"]),
     s_signoff(), s_footer()]),
]

tpl=os.path.join(os.path.dirname(os.path.abspath(__file__)),"emails")
os.makedirs(tpl,exist_ok=True)
for e in EMAILS:
    html=page(e["subject"], e["preview"], e["rows"]())
    open(os.path.join(tpl,e["slug"]+".html"),"w").write(html)
    print(f'{e["alias"]:34s} {len(html)//1024}KB  "{e["subject"]}"')
print("ASSET_BASE:",ASSET_BASE)
