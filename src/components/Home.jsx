import { useI18n } from '../i18n'
import { getActiveSinglist } from '../utils/singlists'
import { getFestivalInfo } from '../utils/festivals'
import data from '../data/aartis.json'

function todayAarti(now = new Date()) {
  const all = []
  data.deities.forEach((d) =>
    d.aartis.forEach((a) =>
      all.push({ deityId: d.id, deityName: d.name, aartiId: a.id, title: a.title, subtitle: a.subtitle, lang: a.lang })
    )
  )
  if (all.length === 0) return null
  const start = new Date(now.getFullYear(), 0, 0)
  const day = Math.floor((now - start) / 86400000)
  return all[day % all.length]
}

const QUICK = [
  { id: 'aarti', emoji: '🪔' },
  { id: 'singlist', emoji: '📖' },
  { id: 'quiz', emoji: '🏆' },
]

export default function Home({ onSelect, onOpenAarti }) {
  const { t } = useI18n()
  const active = getActiveSinglist()
  const fest = getFestivalInfo()
  const today = todayAarti()

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-5 text-center">
      <section className="px-2 pt-6">
        <div
          className="bg-gradient-to-b from-primary to-maroon bg-clip-text pt-1.5 font-serif text-[clamp(74px,20vw,112px)] leading-none text-transparent drop-shadow-[0_8px_20px_rgba(232,117,26,0.25)]"
          aria-hidden
        >
          ॐ
        </div>
        <h1 className="mt-2 font-serif text-[clamp(30px,6vw,36px)] font-bold tracking-wide text-maroon">
          गणपती बाप्पा मोरया
        </h1>
        <p className="mt-1 font-serif text-[clamp(16px,4vw,19px)] font-semibold text-primary">
          मंगलमूर्ती मोरया
        </p>
      </section>

      {fest.isFestival && (
        <div className="flex items-center gap-3 rounded-card bg-gradient-to-br from-primary to-primary-hover p-3.5 text-left text-white shadow-primary">
          <span className="text-[28px]" aria-hidden>🪔</span>
          <div className="flex flex-col">
            <strong className="text-[15px]">{t('home.festivalActive')}</strong>
            <span className="text-[13px] opacity-90">{t('home.festivalDay', { n: fest.festivalDay })}</span>
          </div>
        </div>
      )}

      {!fest.isFestival && fest.daysUntil != null && fest.daysUntil <= 60 && (
        <div className="rounded-card border border-border bg-white p-4 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-gray">
            {t('home.festivalCountdown')}
          </p>
          <p className="mt-1 font-serif text-[clamp(18px,3vw,22px)] font-bold text-maroon">Ganesh Chaturthi</p>
          <div className="mt-3 flex justify-center gap-2.5">
            <div className="flex flex-col items-center rounded-[14px] border border-primary/15 bg-cream px-[22px] py-3">
              <span className="text-[34px] font-extrabold leading-none text-primary">{fest.daysUntil}</span>
              <span className="mt-1 text-xs text-gray">{t('home.days')}</span>
            </div>
          </div>
        </div>
      )}

      {today && (
        <button
          className="flex w-full cursor-pointer items-center gap-3.5 rounded-card bg-gradient-to-br from-maroon to-maroon-dark p-[18px] text-left text-white shadow-raised transition-transform active:scale-[0.99]"
          onClick={() => onOpenAarti(today.deityId, today.aartiId)}
        >
          <span className="inline-flex h-14 w-14 flex-none items-center justify-center rounded-[16px] bg-white/10 text-[28px]" aria-hidden>
            🪔
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[11px] font-bold uppercase tracking-[1px] text-gold">{t('home.todayAarti')}</span>
            <span className="font-serif text-[18px] font-bold">{today.title}</span>
            <span className="text-xs opacity-85">{today.deityName} · {today.subtitle}</span>
          </span>
          <span className="inline-flex flex-none items-center gap-1.5 rounded-pill bg-gold px-3.5 py-2 text-[13px] font-extrabold text-maroon-dark">
            <span>{t('home.start')}</span>
            <span aria-hidden>→</span>
          </span>
        </button>
      )}

      <section className="text-left">
        <h2 className="mb-3 font-serif font-bold text-[clamp(18px,3vw,22px)] text-maroon">
          {t('home.quickActions')}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(104px,1fr))] gap-3">
          {QUICK.map((q) => (
            <button
              key={q.id}
              className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-border bg-white p-[18px] shadow-card transition-transform hover:-translate-y-0.5 hover:border-primary hover:shadow-raised"
              onClick={() => onSelect(q.id)}
            >
              <span className="text-[28px]" aria-hidden>{q.emoji}</span>
              <span className="text-[13px] font-bold text-brown">{t(`nav.${q.id}`)}</span>
            </button>
          ))}
          {active && (
            <button
              className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-border bg-white p-[18px] shadow-card transition-transform hover:-translate-y-0.5 hover:border-primary hover:shadow-raised"
              onClick={() => onSelect('singlist')}
            >
              <span className="text-[28px]" aria-hidden>{active.emoji || '📖'}</span>
              <span className="text-[13px] font-bold text-brown">{active.name}</span>
            </button>
          )}
        </div>
      </section>

      <p className="mt-2 pb-2 font-serif font-bold tracking-wide text-primary">सुखकर्ता दुःखहर्ता 🙏</p>
    </div>
  )
}