import { useState } from 'react'
import { scoringDimensions, standardsTerms } from '../data/lessons'
import { SealBadge } from '../components/SealBadge'
import { GoldRule } from '../components/GoldRule'

export function Standards() {
  const [tab, setTab] = useState<'terms' | 'scoring'>('terms')
  const [q, setQ] = useState('')

  const filtered = standardsTerms.filter(
    (t) => !q || t.term.includes(q) || t.def.includes(q),
  )

  return (
    <div className="animate-fade-up max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <SealBadge text="准" size="md" className="mx-auto" />
        <h1 className="font-serif text-3xl text-paper">动作标准库</h1>
        <p className="text-mist text-sm">术语释义与评分维度，支撑阶段考核与教练统一口径。</p>
        <GoldRule className="w-24 mx-auto" />
      </div>

      <div className="flex justify-center gap-2">
        {(
          [
            { id: 'terms' as const, label: '术语表' },
            { id: 'scoring' as const, label: '评分维度' },
          ]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm border transition-colors ${
              tab === t.id
                ? 'border-gold/50 bg-gold/10 text-gold-soft'
                : 'border-ink-border text-mist hover:text-paper'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'terms' && (
        <div className="space-y-4">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索术语…"
            className="w-full max-w-sm mx-auto block px-4 py-2.5 rounded-lg bg-ink-elevated border border-ink-border text-sm text-paper placeholder:text-mist/50 focus:outline-none focus:border-gold/50"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((t) => (
              <article
                key={t.term}
                className="rounded-xl border border-ink-border bg-ink-elevated p-5 hover:border-gold/30 transition-colors"
              >
                <h3 className="font-serif text-lg text-gold-soft mb-2">{t.term}</h3>
                <p className="text-sm text-mist leading-relaxed">{t.def}</p>
              </article>
            ))}
            {!filtered.length && (
              <p className="text-sm text-mist col-span-2 text-center py-8">无匹配术语</p>
            )}
          </div>
        </div>
      )}

      {tab === 'scoring' && (
        <div className="space-y-4">
          {scoringDimensions.map((d) => (
            <article
              key={d.name}
              className="rounded-xl border border-ink-border bg-ink-elevated p-5 flex gap-5 items-start"
            >
              <div className="w-16 shrink-0 text-center">
                <div className="font-serif text-2xl text-vermillion tabular-nums">{d.weight}</div>
                <div className="text-[10px] text-mist">权重 %</div>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg text-paper mb-1">{d.name}</h3>
                <p className="text-sm text-mist">{d.desc}</p>
                <div className="mt-3 h-1 rounded-full bg-ink-border overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-vermillion to-gold" style={{ width: `${d.weight * 2.5}%` }} />
                </div>
              </div>
            </article>
          ))}
          <p className="text-xs text-mist text-center pt-2">
            五项合计 100%。安全规范不达标可一票否决当次考核。
          </p>
        </div>
      )}
    </div>
  )
}
