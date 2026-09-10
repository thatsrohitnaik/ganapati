import { useI18n } from '../i18n'

export default function More({ onSelect }) {
  const { t } = useI18n()

  const items = [
    { id: 'japa', emoji: '📿', title: t('home.japa.title'), desc: t('home.japa.desc') },
    { id: 'settings', emoji: '⚙️', title: t('settings.title'), desc: t('settings.subtitle') },
  ]

  return (
    <div className="mx-auto max-w-[720px] px-4 pt-3 pb-15">
      <h1 className="mb-3.5 text-left text-[clamp(24px,5vw,30px)] text-maroon">{t('nav.more')}</h1>

      <div className="mb-[22px] flex flex-col gap-2.5">
        {items.map((item) => (
          <button
            key={item.id}
            className="flex w-full cursor-pointer items-center gap-3 rounded-card border border-border bg-white p-3.5 text-left shadow-card transition-colors hover:border-primary hover:shadow-raised"
            onClick={() => onSelect(item.id)}
          >
            <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-cream text-[24px]" aria-hidden>
              {item.emoji}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[15px] font-bold text-brown">{item.title}</span>
              <span className="text-xs text-gray">{item.desc}</span>
            </span>
            <span className="flex-none text-[22px] text-gray" aria-hidden>›</span>
          </button>
        ))}
      </div>

      <div className="rounded-card border border-border bg-white p-[22px] text-center shadow-card">
        <p className="font-serif text-[34px] font-bold text-primary" aria-hidden>ॐ</p>
        <p className="mt-1 font-serif text-[18px] font-bold text-maroon">गणपती बाप्पा मोरया</p>
        <p className="mt-2 text-[13px] leading-relaxed text-gray">{t('more.about')}</p>
        <p className="mt-2 text-[11px] uppercase tracking-[1px] text-gray">v0.3.0</p>
      </div>
    </div>
  )
}