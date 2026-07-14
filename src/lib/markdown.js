const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const inline = (value) => escapeHtml(value)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<span class="md-link">$1</span>')

export function markdownToHtml(markdown) {
  const lines = markdown.split('\n')
  const output = []
  let paragraph = []
  let listType = null
  let code = []
  let inCode = false
  let table = []

  const flushParagraph = () => {
    if (!paragraph.length) return
    output.push(`<p>${inline(paragraph.join(' '))}</p>`)
    paragraph = []
  }
  const flushList = () => {
    if (!listType) return
    output.push(`</${listType}>`)
    listType = null
  }
  const flushTable = () => {
    if (!table.length) return
    const rows = table.filter((row) => !/^\|?[\s:-]+\|/.test(row))
    const html = rows.map((row, index) => {
      const cells = row.split('|').map((cell) => cell.trim()).filter(Boolean)
      const tag = index === 0 ? 'th' : 'td'
      return `<tr>${cells.map((cell) => `<${tag}>${inline(cell)}</${tag}>`).join('')}</tr>`
    }).join('')
    output.push(`<div class="table-scroll"><table>${html}</table></div>`)
    table = []
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd()
    if (line.startsWith('```')) {
      flushParagraph(); flushList(); flushTable()
      if (inCode) {
        output.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
        code = []
      }
      inCode = !inCode
      return
    }
    if (inCode) {
      code.push(rawLine)
      return
    }
    if (line.startsWith('|')) {
      flushParagraph(); flushList(); table.push(line); return
    }
    flushTable()
    if (!line.trim()) {
      flushParagraph(); flushList(); return
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/)
    if (heading) {
      flushParagraph(); flushList()
      const level = Math.min(heading[1].length + 1, 4)
      output.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      return
    }
    if (/^---+$/.test(line)) {
      flushParagraph(); flushList(); output.push('<hr>'); return
    }
    if (line.startsWith('> ')) {
      flushParagraph(); flushList(); output.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); return
    }
    const bullet = line.match(/^[-*]\s+(.+)$/)
    const ordered = line.match(/^\d+\.\s+(.+)$/)
    if (bullet || ordered) {
      flushParagraph()
      const nextType = bullet ? 'ul' : 'ol'
      if (listType !== nextType) {
        flushList(); listType = nextType; output.push(`<${listType}>`)
      }
      output.push(`<li>${inline((bullet || ordered)[1])}</li>`)
      return
    }
    paragraph.push(line.trim())
  })

  flushParagraph(); flushList(); flushTable()
  if (inCode && code.length) output.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
  return output.join('')
}
