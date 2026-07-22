const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function renderScreenshotFidelityEmail(data) {
  const rows = (data.slices || []).map((slice) => {
    const displayHeight = Math.round(Number(slice.height) / 2);
    const image = `<img src="${escapeHtml(slice.src)}" width="600" height="${displayHeight}" alt="${escapeHtml(slice.alt || '')}" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;">`;
    const content = slice.href ? `<a href="${escapeHtml(slice.href)}" style="display:block;text-decoration:none;">${image}</a>` : image;
    return `<!-- ${escapeHtml(slice.name)} --><tr><td style="padding:0;font-size:0;line-height:0;">${content}</td></tr>`;
  }).join('');

  return `<!DOCTYPE html><html lang="${escapeHtml(data.lang || 'en-GB')}" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>${escapeHtml(data.title || 'Sunless by Jimmy Coco')}</title><style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0;mso-table-rspace:0}img{-ms-interpolation-mode:bicubic}@media only screen and (max-width:600px){.container{width:100%!important}}</style></head><body style="margin:0;padding:0;background:#F7F7F7;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#F7F7F7;">${escapeHtml(data.preview || '')}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F7F7F7" style="background:#F7F7F7;"><tr><td align="center" style="padding:0;"><table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">${rows}</table></td></tr></table></body></html>`;
}

module.exports = { renderScreenshotFidelityEmail };
