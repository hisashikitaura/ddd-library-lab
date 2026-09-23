import { DomainError } from '../errors/DomainError'

/** 返却期限。貸出日より後であることを生成時に保証する Value Object */
export class DueDate {
  readonly value: Date

  private constructor(value: Date) {
    this.value = value
  }

  static create(due: Date, loanedAt: Date): DueDate {
    if (!(due instanceof Date) || Number.isNaN(due.getTime())) {
      throw new DomainError('INVALID_DUE_DATE', '返却期限が不正です')
    }
    if (!(loanedAt instanceof Date) || Number.isNaN(loanedAt.getTime())) {
      throw new DomainError('INVALID_DUE_DATE', '貸出日が不正です')
    }
    if (due.getTime() <= loanedAt.getTime()) {
      throw new DomainError('INVALID_DUE_DATE', '返却期限は貸出日より後である必要があります')
    }
    return new DueDate(new Date(due.getTime()))
  }

  equals(other: DueDate): boolean {
    return this.value.getTime() === other.value.getTime()
  }

  toJSON(): string {
    return this.value.toISOString()
  }

  static fromJSON(iso: string, loanedAt: Date): DueDate {
    return DueDate.create(new Date(iso), loanedAt)
  }
}
