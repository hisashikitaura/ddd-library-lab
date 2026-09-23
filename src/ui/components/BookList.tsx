import type { BookAvailability } from '../../application/services/LoanService'

type Props = {
  items: BookAvailability[]
}

export function BookList({ items }: Props) {
  return (
    <section className="card">
      <h2>蔵書一覧（シード）</h2>
      <ul className="book-list">
        {items.map(({ book, availableCopies, activeLoanCount }) => (
          <li key={book.id}>
            <div className="book-list__main">
              <strong>{book.title}</strong>
              <span className={availableCopies > 0 ? 'badge badge--active' : 'badge badge--returned'}>
                在庫 {availableCopies} / {book.totalCopies}
              </span>
            </div>
            <p className="book-list__meta">
              {book.author} · 貸出中 {activeLoanCount}冊
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
