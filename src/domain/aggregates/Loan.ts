import { DomainError } from '../errors/DomainError'
import type { BookId } from '../entities/Book'
import type { MemberId } from '../entities/Member'
import { DueDate } from '../value-objects/DueDate'
import {
  bookLoanedEvent,
  bookReturnedEvent,
  type DomainEvent,
} from '../events/DomainEvent'

export type LoanId = string
export type LoanStatus = 'active' | 'returned'

export const MEMBER_MAX_ACTIVE_LOANS = 5

export class Loan {
  readonly id: LoanId
  readonly bookId: BookId
  readonly memberId: MemberId
  readonly loanedAt: Date
  readonly dueDate: DueDate
  private _status: LoanStatus
  private _domainEvents: DomainEvent[] = []

  private constructor(
    id: LoanId,
    bookId: BookId,
    memberId: MemberId,
    loanedAt: Date,
    dueDate: DueDate,
    status: LoanStatus,
  ) {
    this.id = id
    this.bookId = bookId
    this.memberId = memberId
    this.loanedAt = loanedAt
    this.dueDate = dueDate
    this._status = status
  }

  get status(): LoanStatus {
    return this._status
  }

  get isActive(): boolean {
    return this._status === 'active'
  }

  /**
   * 貸出（checkout）。集約ルート経由で不変条件をまとめて検査する。
   */
  static create(params: {
    id: LoanId
    bookId: BookId
    memberId: MemberId
    loanedAt: Date
    dueDate: Date
    bookTotalCopies: number
    activeLoansForBook: number
    memberActiveLoans: ReadonlyArray<Loan>
  }): Loan {
    if (!(params.loanedAt instanceof Date) || Number.isNaN(params.loanedAt.getTime())) {
      throw new DomainError('INVALID_LOAN', '貸出日が不正です')
    }

    const dueDate = DueDate.create(params.dueDate, params.loanedAt)

    if (params.activeLoansForBook >= params.bookTotalCopies) {
      throw new DomainError(
        'NO_AVAILABLE_COPIES',
        `この本は貸出可能な冊数がありません（総冊数 ${params.bookTotalCopies} / 貸出中 ${params.activeLoansForBook}）`,
      )
    }

    const alreadyHasSameBook = params.memberActiveLoans.some(
      (l) => l.isActive && l.bookId === params.bookId,
    )
    if (alreadyHasSameBook) {
      throw new DomainError(
        'DUPLICATE_ACTIVE_LOAN',
        '同じ会員が同じ本を二重に借りることはできません',
      )
    }

    if (params.memberActiveLoans.filter((l) => l.isActive).length >= MEMBER_MAX_ACTIVE_LOANS) {
      throw new DomainError(
        'MEMBER_LOAN_LIMIT',
        `会員の同時貸出上限（${MEMBER_MAX_ACTIVE_LOANS}冊）に達しています`,
      )
    }

    const loan = new Loan(
      params.id,
      params.bookId,
      params.memberId,
      new Date(params.loanedAt.getTime()),
      dueDate,
      'active',
    )
    loan._domainEvents.push(
      bookLoanedEvent({
        loanId: loan.id,
        bookId: loan.bookId,
        memberId: loan.memberId,
        dueDate: loan.dueDate.toJSON(),
      }),
    )
    return loan
  }

  /** 返却。active のときだけ許可し Domain Event を発行する */
  returnBook(): void {
    if (this._status !== 'active') {
      throw new DomainError('NOT_ACTIVE_LOAN', '貸出中の貸出記録のみ返却できます')
    }
    this._status = 'returned'
    this._domainEvents.push(
      bookReturnedEvent({
        loanId: this.id,
        bookId: this.bookId,
        memberId: this.memberId,
      }),
    )
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents]
    this._domainEvents = []
    return events
  }

  toJSON(): {
    id: string
    bookId: string
    memberId: string
    loanedAt: string
    dueDate: string
    status: LoanStatus
  } {
    return {
      id: this.id,
      bookId: this.bookId,
      memberId: this.memberId,
      loanedAt: this.loanedAt.toISOString(),
      dueDate: this.dueDate.toJSON(),
      status: this._status,
    }
  }

  static fromJSON(json: {
    id: string
    bookId: string
    memberId: string
    loanedAt: string
    dueDate: string
    status: LoanStatus
  }): Loan {
    const loanedAt = new Date(json.loanedAt)
    return new Loan(
      json.id,
      json.bookId,
      json.memberId,
      loanedAt,
      DueDate.fromJSON(json.dueDate, loanedAt),
      json.status,
    )
  }
}
