import { DomainError } from '../errors/DomainError'

export type BookId = string

export class Book {
  readonly id: BookId
  readonly title: string
  readonly author: string
  readonly totalCopies: number

  private constructor(id: BookId, title: string, author: string, totalCopies: number) {
    this.id = id
    this.title = title
    this.author = author
    this.totalCopies = totalCopies
  }

  static create(id: BookId, title: string, author: string, totalCopies: number): Book {
    if (!id.trim()) {
      throw new DomainError('INVALID_BOOK', '書籍IDが空です')
    }
    if (!title.trim()) {
      throw new DomainError('INVALID_BOOK', '書名が空です')
    }
    if (!author.trim()) {
      throw new DomainError('INVALID_BOOK', '著者が空です')
    }
    if (!Number.isInteger(totalCopies) || totalCopies < 1) {
      throw new DomainError('INVALID_BOOK', '総冊数は1以上の整数である必要があります')
    }
    return new Book(id, title.trim(), author.trim(), totalCopies)
  }

  availableCopies(activeLoanCount: number): number {
    return Math.max(0, this.totalCopies - activeLoanCount)
  }

  toJSON(): { id: string; title: string; author: string; totalCopies: number } {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      totalCopies: this.totalCopies,
    }
  }

  static fromJSON(json: {
    id: string
    title: string
    author: string
    totalCopies: number
  }): Book {
    return Book.create(json.id, json.title, json.author, json.totalCopies)
  }
}
