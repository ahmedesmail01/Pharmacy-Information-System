import type { JSONContent } from '@tiptap/react'
import type { InvoiceData } from '../types/template.types'

function resolvePath(obj: any, path: string): unknown {
  return path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj)
}

export function interpolateContent(json: JSONContent, data: InvoiceData): JSONContent {
  if (!json) return json

  // If it's a text node, replace {{field}} or {{field.subfield}}
  if (json.type === 'text' && json.text) {
    const text = json.text.replace(/\{\{([^}]+)\}\}/g, (match, fieldName) => {
      const value = resolvePath(data, fieldName.trim())
      return value !== undefined && value !== null ? String(value) : match
    })
    return { ...json, text }
  }

  // If it has children, recursively interpolate them
  if (json.content) {
    return {
      ...json,
      content: json.content.map((child) => interpolateContent(child, data)),
    }
  }

  return json
}
