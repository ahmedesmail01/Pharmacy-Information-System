import type { InvoiceTemplate } from '../types/template.types'

export function serializeTemplate(template: InvoiceTemplate): string {
  return JSON.stringify({ ...template, version: (template.version ?? 1) })
}

export function deserializeTemplate(json: string): InvoiceTemplate {
  return JSON.parse(json) as InvoiceTemplate
}

export async function saveTemplate(
  template: InvoiceTemplate,
  apiUrl: string
): Promise<InvoiceTemplate> {
  const method = template.id ? 'PUT' : 'POST'
  const url = template.id ? `${apiUrl}/${template.id}` : apiUrl

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: serializeTemplate({ ...template, updatedAt: new Date().toISOString() }),
  })

  if (!res.ok) throw new Error(`Failed to save template: ${res.statusText}`)
  return res.json()
}
