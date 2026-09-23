import type { Loan } from '../../domain/aggregates/Loan'
import type { Book } from '../../domain/entities/Book'
import type { Member } from '../../domain/entities/Member'

type Props = {
  loans: Loan[]
  books: Book[]
  members: Member[]
  busy: boolean
  onReturn: (id: string) => Promise<void>
}

function bookTitle(books: Book[], id: string): string {
  return books.find((b) => b.id === id)?.title ?? id
}

function memberName(members: Member[], id: string): string {
  return members.find((m) => m.id === id)?.name ?? id
}

function fmt(d: Date): string {
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

export function LoanList({ loans, books, members, busy, onReturn }: Props) {
  const active = loans
    .filter((l) => l.isActive)
    .sort((a, b) => b.loanedAt.getTime() - a.loanedAt.getTime())

  return (
    <section className="card">
      <h2>貸出中一覧</h2>
      {active.length === 0 ? (
        <p className="muted">貸出中の本はありません</p>
      ) : (
        <ul className="loan-list">
          {active.map((l) => (
            <li key={l.id} className="loan-item">
              <div className="loan-item__main">
                <strong>{bookTitle(books, l.bookId)}</strong>
                <span className="badge badge--active">貸出中</span>
              </div>
              <p className="loan-item__meta">
                会員: {memberName(members, l.memberId)} · 貸出日 {fmt(l.loanedAt)} · 期限{' '}
                {fmt(l.dueDate.value)}
              </p>
              <button
                type="button"
                className="btn btn--danger"
                disabled={busy}
                onClick={() => void onReturn(l.id)}
              >
                返却
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
