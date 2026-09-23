import { Loan, type LoanId } from '../../domain/aggregates/Loan'
import type { BookId } from '../../domain/entities/Book'
import type { MemberId } from '../../domain/entities/Member'
import type { LoanRepository } from '../../domain/repositories/LoanRepository'

const KEY = 'ddd-library-lab:loans'

type LoanJson = ReturnType<Loan['toJSON']>

export class LocalStorageLoanRepository implements LoanRepository {
  async findAll(): Promise<Loan[]> {
    return this.readAll()
  }

  async findById(id: LoanId): Promise<Loan | null> {
    const all = await this.readAll()
    return all.find((l) => l.id === id) ?? null
  }

  async findActiveByBookId(bookId: BookId): Promise<Loan[]> {
    const all = await this.readAll()
    return all.filter((l) => l.bookId === bookId && l.isActive)
  }

  async findActiveByMemberId(memberId: MemberId): Promise<Loan[]> {
    const all = await this.readAll()
    return all.filter((l) => l.memberId === memberId && l.isActive)
  }

  async save(loan: Loan): Promise<void> {
    const all = await this.readAll()
    const idx = all.findIndex((l) => l.id === loan.id)
    if (idx >= 0) {
      all[idx] = loan
    } else {
      all.push(loan)
    }
    localStorage.setItem(KEY, JSON.stringify(all.map((l) => l.toJSON())))
  }

  private readAll(): Loan[] {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as LoanJson[]
    return list.map((j) => Loan.fromJSON(j))
  }
}
