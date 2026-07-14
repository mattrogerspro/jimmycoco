const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function renderBlock(block, theme) {
  const accent = theme.accent;
  const text = theme.text;
  const heading = theme.heading;

  switch (block.type) {
    case 'paragraph':
      return `<p class="sans" style="margin:0 0 18px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.62;color:${text};">${block.html || ''}</p>`;
    case 'bullets':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:2px 0 24px 0;">${(block.items || []).map(item => `<tr><td valign="top" style="width:22px;padding:5px 0;color:${accent};font-size:15px;">•</td><td class="sans" style="padding:5px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15.5px;line-height:1.55;color:${text};">${item}</td></tr>`).join('')}</table>`;
    case 'offer':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 28px 0;"><tr><td style="background:#F1E9DF;border-left:3px solid ${accent};padding:20px 22px;"><p class="sans" style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15.5px;line-height:1.55;color:${text};">${block.html || ''}</p></td></tr></table>`;
    case 'quote':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 28px 0;"><tr><td style="padding:22px 24px;border-top:1px solid #E4DACE;border-bottom:1px solid #E4DACE;"><p class="serif" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.45;color:${heading};">“${block.html || ''}”</p>${block.by ? `<p class="sans" style="margin:12px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${accent};">${block.by}</p>` : ''}</td></tr></table>`;
    case 'divider':
      return '<div style="height:1px;background:#E4DACE;margin:8px 0 26px 0;line-height:1px;font-size:1px;">&nbsp;</div>';
    case 'cta':
      return block.label && block.url ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0 0;"><tr><td bgcolor="${theme.buttonBackground}" style="border-radius:3px;"><a href="${block.url}" class="sans" style="display:inline-block;padding:15px 30px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${theme.buttonText};text-decoration:none;border-radius:3px;">${block.label}</a></td></tr></table>` : '';
    case 'note':
      return `<p class="sans" style="margin:14px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.5;color:#7A726A;">${block.html || ''}</p>`;
    default:
      throw new Error(`Unsupported email block type: ${block.type}`);
  }
}

function renderEmail(data) {
  const theme = {
    background: data.background || '#EAE2D8',
    cardBackground: data.cardBackground || '#FBF8F3',
    accent: data.accent || '#A77952',
    text: data.text || '#3B3630',
    heading: data.heading || '#24211E',
    buttonBackground: data.buttonBackground || '#26231F',
    buttonText: data.buttonText || '#FFFDF9'
  };
  const brand = data.brand || 'SUNLESS';
  const brandLine = data.brandLine || 'by Jimmy Coco';
  const blocks = (data.blocks || []).map(block => renderBlock(block, theme)).join('');
  const unsubscribeLabel = data.unsubscribeLabel || 'Manage preferences or unsubscribe';

  return `<!DOCTYPE html>
<html lang="${escapeHtml(data.lang || 'en')}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(data.title || 'Sunless by Jimmy Coco')}</title>
<!--[if mso]><style>.serif{font-family:Georgia,serif !important}.sans{font-family:Arial,sans-serif !important}</style><![endif]-->
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{margin:0;padding:0;width:100%!important;background:${theme.background}}a{color:${theme.accent}}@media only screen and (max-width:600px){.container{width:100%!important}.px{padding-left:26px!important;padding-right:26px!important}.stack{display:block!important;width:100%!important}}</style>
</head>
<body style="margin:0;padding:0;background:${theme.background};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${theme.background};">${escapeHtml(data.preview || '')}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${theme.background};"><tr><td align="center" style="padding:34px 12px;"><table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
<tr><td align="center" style="padding:6px 0 22px;"><div class="sans" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;letter-spacing:.42em;color:#26231F;text-transform:uppercase;font-weight:600;">${brand}</div><div class="sans" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:9px;letter-spacing:.34em;color:${theme.accent};text-transform:uppercase;padding-top:5px;">${brandLine}</div></td></tr>
<tr><td class="px" style="background:${theme.cardBackground};border-radius:4px;padding:46px 52px 40px;"><p class="sans" style="margin:0 0 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:${theme.accent};">${data.eyebrow || ''}</p><h1 class="serif" style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:33px;line-height:1.14;color:${theme.heading};letter-spacing:-.01em;">${data.headline || ''}</h1>${blocks}</td></tr>
<tr><td class="px" style="padding:30px 52px 8px;"><p class="sans" style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:${theme.text};">${data.senderName || '{{sender_name}}'}<br><span style="color:#7A726A;font-size:13.5px;">${data.senderTitle || '{{sender_title}}'}</span></p></td></tr>
<tr><td class="px" style="padding:24px 52px 8px;"><div style="border-top:1px solid #DCD2C6;"></div></td></tr>
<tr><td class="px" style="padding:14px 52px 30px;"><p class="sans" style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;line-height:1.6;color:#948B81;">${data.businessName || 'Sunless by Jimmy Coco'} · ${data.businessAddress || '{{business_address}}'}<br>${data.unsubscribeText || 'You are receiving this because this message is relevant to your relationship with Sunless by Jimmy Coco.'} <a href="${data.unsubscribeUrl || '{{unsubscribe_link}}'}" style="color:#948B81;text-decoration:underline;">${unsubscribeLabel}</a>.</p></td></tr>
</table></td></tr></table></body></html>`;
}

module.exports = { renderEmail };
