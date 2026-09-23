import type { Loan, LoanId } from '../aggregates/Loan'
import type { BookId } from '../entities/Book'
import type { MemberId } from '../entities/Member'

export interface LoanRepository {
  findAll(): Promise<Loan[]>
  findById(id: LoanId): Promise<Loan | null>
  findActiveByBookId(bookId: BookId): Promise<Loan[]>
  findActiveByMemberId(memberId: MemberId): Promise<Loan[]>
  save(loan: Loan): Promise<void>
}
