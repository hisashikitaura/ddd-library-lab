export type DomainEventType = 'BookLoaned' | 'BookReturned'

export type BookLoanedPayload = {
  loanId: string
  bookId: string
  memberId: string
  dueDate: string
}

export type BookReturnedPayload = {
  loanId: string
  bookId: string
  memberId: string
}

export type DomainEvent =
  | {
      type: 'BookLoaned'
      occurredAt: Date
      payload: BookLoanedPayload
    }
  | {
      type: 'BookReturned'
      occurredAt: Date
      payload: BookReturnedPayload
    }

export function bookLoanedEvent(payload: BookLoanedPayload): DomainEvent {
  return {
    type: 'BookLoaned',
    occurredAt: new Date(),
    payload,
  }
}

export function bookReturnedEvent(payload: BookReturnedPayload): DomainEvent {
  return {
    type: 'BookReturned',
    occurredAt: new Date(),
    payload,
  }
}
