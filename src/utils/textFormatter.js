/**
 * Utilidad compartida para formatear texto markdown a HTML
 * Evita duplicación de código entre RichTextEditor y UniversalDetails
 */

export const formatMarkdownToHtml = (text) => {
  if (!text) return ''
  
  let processed = text
  
  // Procesar elementos inline primero
  processed = processed
    // Negritas
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #ffffff;">$1</strong>')
    // Cursivas (evitar conflicto con negritas)
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em style="font-style: italic; color: #e5e7eb;">$1</em>')
    // Subrayados
    .replace(/<u>(.*?)<\/u>/g, '<u style="text-decoration: underline; color: #ffffff;">$1</u>')
  
  // Procesar por líneas
  const lines = processed.split('\n')
  const processedLines = []
  let inList = false
  let inOrderedList = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Lista no ordenada
    if (/^-\s+(.+)$/.test(line)) {
      if (!inList) {
        processedLines.push('<ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: #e5e7eb;">')
        inList = true
      }
      if (inOrderedList) {
        processedLines.push('</ol>')
        inOrderedList = false
      }
      const content = line.replace(/^-\s+/, '')
      processedLines.push(`<li style="margin: 0.25rem 0;">${content}</li>`)
    }
    // Lista ordenada
    else if (/^\d+\.\s+(.+)$/.test(line)) {
      if (!inOrderedList) {
        processedLines.push('<ol style="margin: 0.5rem 0; padding-left: 1.5rem; color: #e5e7eb;">')
        inOrderedList = true
      }
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      const content = line.replace(/^\d+\.\s+/, '')
      processedLines.push(`<li style="margin: 0.25rem 0;">${content}</li>`)
    }
    // Citas
    else if (/^>\s+(.+)$/.test(line)) {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      if (inOrderedList) {
        processedLines.push('</ol>')
        inOrderedList = false
      }
      const content = line.replace(/^>\s+/, '')
      processedLines.push(`<blockquote style="border-left: 3px solid #8b5cf6; padding-left: 1rem; margin: 0.5rem 0; color: #d1d5db; font-style: italic; background: rgba(139, 92, 246, 0.1); padding: 0.75rem 1rem; border-radius: 0 8px 8px 0;">${content}</blockquote>`)
    }
    // Línea normal
    else {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      if (inOrderedList) {
        processedLines.push('</ol>')
        inOrderedList = false
      }
      if (line.trim()) {
        processedLines.push(line)
      } else {
        processedLines.push('<br>')
      }
    }
  }
  
  // Cerrar listas abiertas
  if (inList) processedLines.push('</ul>')
  if (inOrderedList) processedLines.push('</ol>')
  
  return processedLines.join('\n')
}