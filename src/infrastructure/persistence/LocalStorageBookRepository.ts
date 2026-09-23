import { Book, type BookId } from '../../domain/entities/Book'
import type { BookRepository } from '../../domain/repositories/BookRepository'
import { SEED_BOOKS } from './seedData'

const KEY = 'ddd-library-lab:books'

export class LocalStorageBookRepository implements BookRepository {
  async findAll(): Promise<Book[]> {
    this.ensureSeeded()
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as Array<{
      id: string
      title: string
      author: string
      totalCopies: number
    }>
    return list.map((b) => Book.fromJSON(b))
  }

  async findById(id: BookId): Promise<Book | null> {
    const all = await this.findAll()
    return all.find((b) => b.id === id) ?? null
  }

  async saveAll(books: Book[]): Promise<void> {
    localStorage.setItem(KEY, JSON.stringify(books.map((b) => b.toJSON())))
  }

  private ensureSeeded(): void {
    if (localStorage.getItem(KEY)) return
    localStorage.setItem(KEY, JSON.stringify(SEED_BOOKS.map((b) => b.toJSON())))
  }
}
