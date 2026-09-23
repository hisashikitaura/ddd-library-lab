import type { ConceptLog } from '../application/services/LoanService'

export type ConceptEntry = ConceptLog & { id: string }

export function toEntry(log: ConceptLog): ConceptEntry {
  return { ...log, id: crypto.randomUUID() }
}
