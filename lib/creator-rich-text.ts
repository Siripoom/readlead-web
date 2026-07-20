import sanitizeHtml from 'sanitize-html'

const allowedClasses: Record<string, string[]> = {
  p: ['align-left', 'align-center', 'align-right', 'first-line-indent'],
  h2: ['align-left', 'align-center', 'align-right'],
}

export function sanitizeEpisodeHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: ['p', 'h2', 'blockquote', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'hr', 'br'],
    allowedAttributes: { p: ['class', 'style'], h2: ['class', 'style'] },
    allowedClasses,
    allowedStyles: { '*': { 'text-align': [/^(?:left|center|right)$/] } },
    disallowedTagsMode: 'discard',
  }).trim()
}

export function isRichEpisodeContent(value: string) {
  return /<(?:p|h2|blockquote|strong|em|u|s|ul|ol|li|hr|br)\b/i.test(value)
}

export function plainTextToEpisodeHtml(value: string) {
  const escaped = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
  return escaped.split(/\n{2,}|\n/).map((line) => line.trim()).filter(Boolean).map((line) => `<p>${line}</p>`).join('')
}
