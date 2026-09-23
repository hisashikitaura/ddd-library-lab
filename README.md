# 図書館の貸出ラボ（ddd-library-lab）

図書館ドメインで **DDD の基本概念** を体感する学習用 Web アプリです。Vite + React + TypeScript のグリーンフィールド実装です（会議室ラボとは別ドメイン）。

## ゴール

- Entity / Value Object / Aggregate / Invariant / Repository / Domain Event を **コードと UI の両面** で追える
- ドメイン層が React に依存しない構成を体験する
- 貸出・返却の成功／失敗のたびに、右パネル「いま動いた概念」に短い日本語解説が追記される

## 起動

```bash
npm i
npm run dev
```

ブラウザで表示された URL（通常 `http://localhost:5173`）を開きます。

本番ビルド確認:

```bash
npm run build
```

## できること（v1）

1. シード済み蔵書（5冊）と会員（3名）の表示、在庫数の確認
2. 貸出（checkout）— 返却期限付き
3. 返却（return）— status → returned + Domain Event `BookReturned`
4. 不変条件違反の拒否と概念ログ
   - 在庫なし（active 貸出数 ≥ totalCopies）
   - 同一会員・同一本の二重貸出
   - 会員の同時貸出上限 5冊
   - active 以外の返却拒否

データはブラウザの `localStorage` に保存されます。

## 学習パス

1. まず1冊借り、右パネルの **Entity / Value Object / Aggregate / Invariant / Repository / Domain Event** の流れを読む
2. 同じ会員で同じ本をもう一度借り、**二重貸出禁止** を確かめる
3. 総冊数1の本（テスト駆動開発）を借り切ったあと再貸出を試み、**在庫なし** を確かめる
4. わざと返却期限を貸出日以前にし **DueDate** の不変条件失敗を見る
5. 返却後に **BookReturned** のログが出ることを確認する
6. `src/domain/` を開き、React import が無いことを確認する
7. `docs/DDD.md` の用語集とディレクトリ対応を読む

## 主なディレクトリ

| パス | 役割 |
|------|------|
| `src/domain/` | エンティティ・VO・集約・イベント・リポジトリ IF・エラー |
| `src/application/` | ユースケース（LoanService） |
| `src/infrastructure/` | localStorage リポジトリ実装・シード |
| `src/ui/` | React UI（日本語コピー） |
| `docs/DDD.md` | 用語集とディレクトリマップ |

詳細は [docs/DDD.md](./docs/DDD.md) を参照してください。
