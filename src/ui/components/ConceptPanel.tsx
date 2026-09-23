import type { ConceptEntry } from '../concepts'

type Props = {
  entries: ConceptEntry[]
  onClear: () => void
}

export function ConceptPanel({ entries, onClear }: Props) {
  return (
    <aside className="concept-panel" aria-label="いま動いた概念">
      <header className="concept-panel__header">
        <h2>いま動いた概念</h2>
        <button type="button" className="btn btn--ghost" onClick={onClear} disabled={entries.length === 0}>
          クリア
        </button>
      </header>
      <p className="concept-panel__hint">操作のたびに Entity / VO / Aggregate などが追記されます</p>
      <ul className="concept-list">
        {entries.length === 0 ? (
          <li className="concept-empty">まだありません。貸出してみてください。</li>
        ) : (
          [...entries].reverse().map((e) => (
            <li key={e.id} className={`concept-item ${e.ok ? 'concept-item--ok' : 'concept-item--ng'}`}>
              <div className="concept-item__meta">
                <span className="concept-kind">{e.kind}</span>
                <time dateTime={e.at.toISOString()}>
                  {e.at.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </time>
              </div>
              <strong className="concept-item__title">{e.title}</strong>
              <p className="concept-item__detail">{e.detail}</p>
            </li>
          ))
        )}
      </ul>
    </aside>
  )
}
