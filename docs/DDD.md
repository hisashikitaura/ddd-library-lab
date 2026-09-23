# DDD 用語集とディレクトリマップ

このラボの **図書館貸出ドメイン** に対応づけた短い用語集です。

## 用語集

| 概念 | このアプリでの具体 | ひとこと |
|------|---------------------|----------|
| **Entity** | `Book` / `Member` | ID で同一性を持つ。書名・会員名が変わっても「同じ本／会員」 |
| **Value Object** | `DueDate` | 返却期限の値そのもの。貸出日より後であることを生成時に保証 |
| **Aggregate（Root）** | `Loan` | 貸出の一貫性境界。作成・返却はルート経由 |
| **Invariant** | 在庫あり・二重貸出禁止・上限5冊・activeのみ返却・期限>貸出日 | 常に守るべきルール。破ったら DomainError |
| **Repository** | `BookRepository` / `MemberRepository` / `LoanRepository` | 集約・エンティティの取得・保存の口。ドメインは保存先を知らない |
| **Domain Event** | `BookLoaned` / `BookReturned` | 「借りた／返した」という事実。副作用のきっかけになる |

## レイヤと依存方向

```
ui  →  application  →  domain
          ↑
   infrastructure（domain の IF を実装）
```

- `domain` は React / localStorage を import しない
- `application` はリポジトリ IF に依存し、実装クラスは知らない
- `infrastructure` が localStorage で IF を実装する
- `ui` が具象リポジトリを組み立てて `LoanService` に渡す

## ディレクトリマップ

```
src/
  domain/
    entities/Book.ts              # Entity
    entities/Member.ts            # Entity
    value-objects/DueDate.ts      # Value Object
    aggregates/Loan.ts            # Aggregate Root
    events/DomainEvent.ts         # Domain Event
    repositories/*.ts             # Repository インターフェース
    errors/DomainError.ts         # 不変条件違反など
  application/
    services/LoanService.ts       # ユースケース + 概念ログ生成
  infrastructure/
    persistence/
      LocalStorageBookRepository.ts
      LocalStorageMemberRepository.ts
      LocalStorageLoanRepository.ts
      seedData.ts
  ui/
    components/                   # 日本語 UI
    concepts.ts
```

## 不変条件（v1）

1. `DueDate`: 返却期限は貸出日より後
2. `Loan.create`: 同書籍の **active** 貸出数が `totalCopies` 未満
3. `Loan.create`: 同一会員が同一書籍を二重に借りない
4. `Loan.create`: 会員の active 貸出は最大 5 件
5. `Loan.returnBook`: status が active のときだけ返却可

## 永続化

- キー: `ddd-library-lab:books` / `ddd-library-lab:members` / `ddd-library-lab:loans`
- 書籍・会員は初回アクセス時にシード（5冊 / 3名）
