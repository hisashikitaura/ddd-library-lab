import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { BookAvailability } from '../../application/services/LoanService'
import type { Member } from '../../domain/entities/Member'

export type CheckoutFormValues = {
  bookId: string
  memberId: string
  dueDate: string
}

type Props = {
  books: BookAvailability[]
  members: Member[]
  busy: boolean
  onSubmit: (values: CheckoutFormValues) => Promise<void>
}

function defaultDueDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function CheckoutForm({ books, members, busy, onSubmit }: Props) {
  const defaultDue = useMemo(() => defaultDueDate(), [])
  const [bookId, setBookId] = useState('')
  const [memberId, setMemberId] = useState('')
  const [dueDate, setDueDate] = useState(defaultDue)

  useEffect(() => {
    if (!bookId && books[0]) setBookId(books[0].book.id)
  }, [books, bookId])

  useEffect(() => {
    if (!memberId && members[0]) setMemberId(members[0].id)
  }, [members, memberId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({ bookId, memberId, dueDate })
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>貸出</h2>
      <label>
        会員
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        書籍
        <select value={bookId} onChange={(e) => setBookId(e.target.value)} required>
          {books.map(({ book, availableCopies }) => (
            <option key={book.id} value={book.id}>
              {book.title}（在庫 {availableCopies}）
            </option>
          ))}
        </select>
      </label>
      <label>
        返却期限
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      </label>
      <button
        type="submit"
        className="btn btn--primary"
        disabled={busy || books.length === 0 || members.length === 0}
      >
        {busy ? '処理中…' : '借りる'}
      </button>
    </form>
  )
}
