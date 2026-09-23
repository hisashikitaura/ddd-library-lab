import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  LoanService,
  type BookAvailability,
  type ConceptLog,
} from './application/services/LoanService'
import type { Loan } from './domain/aggregates/Loan'
import type { Member } from './domain/entities/Member'
import { DomainError } from './domain/errors/DomainError'
import { LocalStorageBookRepository } from './infrastructure/persistence/LocalStorageBookRepository'
import { LocalStorageLoanRepository } from './infrastructure/persistence/LocalStorageLoanRepository'
import { LocalStorageMemberRepository } from './infrastructure/persistence/LocalStorageMemberRepository'
import { BookList } from './ui/components/BookList'
import { CheckoutForm, type CheckoutFormValues } from './ui/components/CheckoutForm'
import { ConceptPanel } from './ui/components/ConceptPanel'
import { LoanList } from './ui/components/LoanList'
import { toEntry, type ConceptEntry } from './ui/concepts'
import './App.css'

type ErrWithConcepts = Error & { concepts?: ConceptLog[] }

export default function App() {
  const service = useMemo(
    () =>
      new LoanService(
        new LocalStorageBookRepository(),
        new LocalStorageMemberRepository(),
        new LocalStorageLoanRepository(),
      ),
    [],
  )

  const [availability, setAvailability] = useState<BookAvailability[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [concepts, setConcepts] = useState<ConceptEntry[]>([])
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  const appendConcepts = useCallback((logs: ConceptLog[]) => {
    setConcepts((prev) => [...prev, ...logs.map(toEntry)])
  }, [])

  const reload = useCallback(async () => {
    const [avail, mems, ls] = await Promise.all([
      service.listBookAvailability(),
      service.listMembers(),
      service.listLoans(),
    ])
    setAvailability(avail)
    setMembers(mems)
    setLoans(ls)
  }, [service])

  useEffect(() => {
    void reload()
  }, [reload])

  async function handleCheckout(values: CheckoutFormValues) {
    setBusy(true)
    setFlash(null)
    try {
      // date input is local calendar day; treat as end-of-day local for due date
      const due = new Date(`${values.dueDate}T23:59:59`)
      const result = await service.checkout({
        bookId: values.bookId,
        memberId: values.memberId,
        dueDate: due,
      })
      appendConcepts(result.concepts)
      setFlash('貸出が完了しました（Domain Event: BookLoaned）')
      await reload()
    } catch (err) {
      const e = err as ErrWithConcepts
      if (e.concepts) appendConcepts(e.concepts)
      setFlash(e instanceof DomainError || e instanceof Error ? e.message : '貸出に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  async function handleReturn(id: string) {
    setBusy(true)
    setFlash(null)
    try {
      const result = await service.returnLoan(id)
      appendConcepts(result.concepts)
      setFlash('返却が完了しました（Domain Event: BookReturned）')
      await reload()
    } catch (err) {
      const e = err as ErrWithConcepts
      if (e.concepts) appendConcepts(e.concepts)
      setFlash(e instanceof DomainError || e instanceof Error ? e.message : '返却に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  const books = availability.map((a) => a.book)

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">DDD Learning Lab</p>
          <h1>図書館の貸出ラボ</h1>
          <p className="lede">図書館ドメインで Entity / VO / Aggregate / Invariant を体感する</p>
        </div>
      </header>

      {flash ? <p className="flash" role="status">{flash}</p> : null}

      <div className="layout">
        <main className="main">
          <BookList items={availability} />
          <CheckoutForm
            books={availability}
            members={members}
            busy={busy}
            onSubmit={handleCheckout}
          />
          <LoanList
            loans={loans}
            books={books}
            members={members}
            busy={busy}
            onReturn={handleReturn}
          />
        </main>
        <ConceptPanel entries={concepts} onClear={() => setConcepts([])} />
      </div>
    </div>
  )
}
