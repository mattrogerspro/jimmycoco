const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const paragraph = (copy) => `<p class="sans" style="margin:0 0 18px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.62;color:#3B3630;">${copy}</p>`;

const bulletList = (items = []) => items.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:2px 0 24px 0;">${items.map(item => `<tr><td valign="top" style="width:22px;padding:5px 0;color:#A77952;font-size:15px;">•</td><td class="sans" style="padding:5px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15.5px;line-height:1.55;color:#3B3630;">${item}</td></tr>`).join('')}</table>` : '';

const featureStrip = (items = []) => items.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;border-top:1px solid #E4DACE;border-bottom:1px solid #E4DACE;"><tr>${items.map(item => `<td align="center" valign="top" style="padding:18px 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;line-height:1.45;letter-spacing:.08em;text-transform:uppercase;color:#615A53;">${item}</td>`).join('')}</tr></table>` : '';

const cta = (label, href) => label && href ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;"><tr><td bgcolor="#26231F" style="border-radius:3px;"><a href="${href}" class="sans" style="display:inline-block;padding:15px 30px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#FFFDF9;text-decoration:none;border-radius:3px;">${label}</a></td></tr></table>` : '';

function renderEmail(data) {
  const body = (data.paragraphs || []).map(paragraph).join('');
  const offer = data.offer ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 28px 0;"><tr><td style="background:#F1E9DF;border-left:3px solid #A77952;padding:20px 22px;"><p class="sans" style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15.5px;line-height:1.55;color:#3B3630;">${data.offer}</p></td></tr></table>` : '';
  const quote = data.quote ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 28px 0;"><tr><td style="padding:22px 24px;border-top:1px solid #E4DACE;border-bottom:1px solid #E4DACE;"><p class="serif" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.45;color:#24211E;">“${data.quote}”</p>${data.quoteAttribution ? `<p class="sans" style="margin:12px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#A77952;">${data.quoteAttribution}</p>` : ''}</td></tr></table>` : '';
  const secondary = data.secondaryCta ? `<p class="sans" style="margin:14px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.5;color:#7A726A;">${data.secondaryCta}</p>` : '';
  const footerUnsubscribe = data.unsubscribeLabel || 'Unsubscribe here';

  return `<!DOCTYPE html>
<html lang="${escapeHtml(data.lang || 'en')}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(data.title || 'Sunless by Jimmy Coco')}</title>
<!--[if mso]><style>.serif{font-family:Georgia,serif !important}.sans{font-family:Arial,sans-serif !important}</style><![endif]-->
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{margin:0;padding:0;width:100%!important;background:#EAE2D8}a{color:#A77952}@media only screen and (max-width:600px){.container{width:100%!important}.px{padding-left:26px!important;padding-right:26px!important}.stack{display:block!important;width:100%!important}}</style>
</head>
<body style="margin:0;padding:0;background:#EAE2D8;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#EAE2D8;">${escapeHtml(data.preview || '')}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EAE2D8;"><tr><td align="center" style="padding:34px 12px;"><table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
<tr><td align="center" style="padding:6px 0 22px;"><div class="sans" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;letter-spacing:.42em;color:#26231F;text-transform:uppercase;font-weight:600;">SUNLESS</div><div class="sans" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:9px;letter-spacing:.34em;color:#A77952;text-transform:uppercase;padding-top:5px;">by Jimmy Coco</div></td></tr>
<tr><td class="px" style="background:#FBF8F3;border-radius:4px;padding:46px 52px 40px;"><p class="sans" style="margin:0 0 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#A77952;">${data.eyebrow || ''}</p><h1 class="serif" style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:33px;line-height:1.14;color:#24211E;letter-spacing:-.01em;">${data.headline || ''}</h1>${featureStrip(data.features)}${body}${offer}${bulletList(data.bullets)}${quote}${cta(data.ctaLabel, data.ctaHref)}${secondary}</td></tr>
<tr><td class="px" style="padding:30px 52px 8px;"><p class="sans" style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#3B3630;">${data.senderName || '{{sender_name}}'}<br><span style="color:#7A726A;font-size:13.5px;">${data.senderTitle || '{{sender_title}}'}</span></p></td></tr>
<tr><td class="px" style="padding:24px 52px 8px;"><div style="border-top:1px solid #DCD2C6;"></div></td></tr>
<tr><td class="px" style="padding:14px 52px 30px;"><p class="sans" style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;line-height:1.6;color:#948B81;">Sunless by Jimmy Coco · ${data.businessAddress || '{{business_address}}'}<br>${data.footerReason || 'You are receiving this because this message is relevant to your business relationship with Sunless by Jimmy Coco.'} <a href="${data.unsubscribeHref || '{{unsubscribe_link}}'}" style="color:#948B81;text-decoration:underline;">${footerUnsubscribe}</a>.</p></td></tr>
</table></td></tr></table></body></html>`;
}

module.exports = { renderEmail };
