import { Book } from '../../domain/entities/Book'
import { Member } from '../../domain/entities/Member'

export const SEED_BOOKS: Book[] = [
  Book.create('book_ddd', 'エリック・エヴァンスのドメイン駆動設計', 'Eric Evans', 2),
  Book.create('book_clean', 'クリーンアーキテクチャ', 'Robert C. Martin', 3),
  Book.create('book_refactor', 'リファクタリング 第2版', 'Martin Fowler', 2),
  Book.create('book_tdd', 'テスト駆動開発', 'Kent Beck', 1),
  Book.create('book_practices', '実践ドメイン駆動設計', 'Vaughn Vernon', 2),
]

export const SEED_MEMBERS: Member[] = [
  Member.create('member_kitaura', '北浦'),
  Member.create('member_sato', '佐藤'),
  Member.create('member_suzuki', '鈴木'),
]
