import type { Book, BookId } from '../entities/Book'

export interface BookRepository {
  findAll(): Promise<Book[]>
  findById(id: BookId): Promise<Book | null>
  saveAll(books: Book[]): Promise<void>
}
