import type { DomainEvent } from '../../domain/events/DomainEvent'
import { DomainError } from '../../domain/errors/DomainError'
import { Loan } from '../../domain/aggregates/Loan'
import type { Book } from '../../domain/entities/Book'
import type { Member } from '../../domain/entities/Member'
import type { BookRepository } from '../../domain/repositories/BookRepository'
import type { MemberRepository } from '../../domain/repositories/MemberRepository'
import type { LoanRepository } from '../../domain/repositories/LoanRepository'

export type CheckoutInput = {
  bookId: string
  memberId: string
  dueDate: Date
}

export type CheckoutResult = {
  loan: Loan
  events: DomainEvent[]
  concepts: ConceptLog[]
}

export type ReturnResult = {
  loan: Loan
  events: DomainEvent[]
  concepts: ConceptLog[]
}

export type ConceptKind =
  | 'Entity'
  | 'Value Object'
  | 'Aggregate'
  | 'Invariant'
  | 'Repository'
  | 'Domain Event'

export type ConceptLog = {
  kind: ConceptKind
  title: string
  detail: string
  ok: boolean
  at: Date
}

export type BookAvailability = {
  book: Book
  activeLoanCount: number
  availableCopies: number
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

export class LoanService {
  private readonly books: BookRepository
  private readonly members: MemberRepository
  private readonly loans: LoanRepository

  constructor(books: BookRepository, members: MemberRepository, loans: LoanRepository) {
    this.books = books
    this.members = members
    this.loans = loans
  }

  async listBooks(): Promise<Book[]> {
    return this.books.findAll()
  }

  async listMembers(): Promise<Member[]> {
    return this.members.findAll()
  }

  async listLoans(): Promise<Loan[]> {
    return this.loans.findAll()
  }

  async listBookAvailability(): Promise<BookAvailability[]> {
    const books = await this.books.findAll()
    const result: BookAvailability[] = []
    for (const book of books) {
      const active = await this.loans.findActiveByBookId(book.id)
      result.push({
        book,
        activeLoanCount: active.length,
        availableCopies: book.availableCopies(active.length),
      })
    }
    return result
  }

  async checkout(input: CheckoutInput): Promise<CheckoutResult> {
    const concepts: ConceptLog[] = []
    const now = () => new Date()

    try {
      const book = await this.books.findById(input.bookId)
      concepts.push({
        kind: 'Repository',
        title: 'BookRepository.findById',
        detail: 'インフラの永続化詳細を隠し、書籍を取得した',
        ok: book !== null,
        at: now(),
      })
      if (!book) {
        throw new DomainError('BOOK_NOT_FOUND', '指定された書籍が見つかりません')
      }

      concepts.push({
        kind: 'Entity',
        title: 'Book',
        detail: `書籍「${book.title}」（総冊数 ${book.totalCopies}）を参照`,
        ok: true,
        at: now(),
      })

      const member = await this.members.findById(input.memberId)
      concepts.push({
        kind: 'Repository',
        title: 'MemberRepository.findById',
        detail: '貸出対象の会員を取得した',
        ok: member !== null,
        at: now(),
      })
      if (!member) {
        throw new DomainError('MEMBER_NOT_FOUND', '指定された会員が見つかりません')
      }

      concepts.push({
        kind: 'Entity',
        title: 'Member',
        detail: `会員「${member.name}」を参照`,
        ok: true,
        at: now(),
      })

      const activeForBook = await this.loans.findActiveByBookId(book.id)
      concepts.push({
        kind: 'Repository',
        title: 'LoanRepository.findActiveByBookId',
        detail: '同書籍の貸出中件数を取得し在庫判定に使う',
        ok: true,
        at: now(),
      })

      const memberActive = await this.loans.findActiveByMemberId(member.id)
      concepts.push({
        kind: 'Repository',
        title: 'LoanRepository.findActiveByMemberId',
        detail: '会員の貸出中一覧を取得し上限・二重貸出を検査',
        ok: true,
        at: now(),
      })

      const loanedAt = new Date()
      const loan = Loan.create({
        id: newId('loan'),
        bookId: book.id,
        memberId: member.id,
        loanedAt,
        dueDate: input.dueDate,
        bookTotalCopies: book.totalCopies,
        activeLoansForBook: activeForBook.length,
        memberActiveLoans: memberActive,
      })

      concepts.push({
        kind: 'Value Object',
        title: 'DueDate',
        detail: '返却期限をひとまとまりにし、貸出日より後であることを保証',
        ok: true,
        at: now(),
      })
      concepts.push({
        kind: 'Aggregate',
        title: 'Loan',
        detail: '貸出の一貫性境界。作成時に在庫・二重貸出・上限をまとめて検査',
        ok: true,
        at: now(),
      })
      concepts.push({
        kind: 'Invariant',
        title: '在庫あり / 二重禁止 / 上限5冊',
        detail: '利用可能冊数・同一本の二重貸出禁止・会員同時5冊まで',
        ok: true,
        at: now(),
      })

      const events = loan.pullDomainEvents()
      for (const ev of events) {
        concepts.push({
          kind: 'Domain Event',
          title: ev.type,
          detail: `貸出 ${ev.payload.loanId} が成立した事実を記録`,
          ok: true,
          at: now(),
        })
      }

      await this.loans.save(loan)
      concepts.push({
        kind: 'Repository',
        title: 'LoanRepository.save',
        detail: '集約を永続化した（localStorage 実装）',
        ok: true,
        at: now(),
      })

      return { loan, events, concepts }
    } catch (err) {
      if (err instanceof DomainError) {
        concepts.push({
          kind: 'Invariant',
          title: err.code,
          detail: err.message,
          ok: false,
          at: now(),
        })
      }
      throw Object.assign(err instanceof Error ? err : new Error(String(err)), { concepts })
    }
  }

  async returnLoan(id: string): Promise<ReturnResult> {
    const concepts: ConceptLog[] = []
    const now = () => new Date()

    try {
      const loan = await this.loans.findById(id)
      concepts.push({
        kind: 'Repository',
        title: 'LoanRepository.findById',
        detail: '返却対象の貸出集約を読み込んだ',
        ok: loan !== null,
        at: now(),
      })
      if (!loan) {
        throw new DomainError('LOAN_NOT_FOUND', '貸出記録が見つかりません')
      }

      concepts.push({
        kind: 'Aggregate',
        title: 'Loan',
        detail: '集約ルート経由で状態遷移する（直接 status を書き換えない）',
        ok: true,
        at: now(),
      })

      loan.returnBook()
      concepts.push({
        kind: 'Invariant',
        title: 'active のみ返却可',
        detail: '既に returned なら拒否する',
        ok: true,
        at: now(),
      })

      const events = loan.pullDomainEvents()
      for (const ev of events) {
        concepts.push({
          kind: 'Domain Event',
          title: ev.type,
          detail: `貸出 ${ev.payload.loanId} が返却された事実を記録`,
          ok: true,
          at: now(),
        })
      }

      await this.loans.save(loan)
      concepts.push({
        kind: 'Repository',
        title: 'LoanRepository.save',
        detail: '返却後の集約状態を保存',
        ok: true,
        at: now(),
      })

      return { loan, events, concepts }
    } catch (err) {
      if (err instanceof DomainError) {
        concepts.push({
          kind: 'Invariant',
          title: err.code,
          detail: err.message,
          ok: false,
          at: now(),
        })
      }
      throw Object.assign(err instanceof Error ? err : new Error(String(err)), { concepts })
    }
  }
}
