import { NavLink, Outlet } from 'react-router-dom'
import { LogoMark } from './LogoMark'

const nav = [
  { to: '/', label: '学习首页', end: true },
  { to: '/path', label: '阶段路径' },
  { to: '/standards', label: '动作标准库' },
  { to: '/profile', label: '我的进度' },
]

export function Layout() {
  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col">
      <header className="sticky top-0 z-50 border-b border-ink-border/80 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
          <NavLink to="/" className="flex items-center gap-3 group shrink-0">
            <LogoMark size={34} className="shrink-0 shadow-sm shadow-vermillion/20 transition-transform group-hover:scale-[1.04]" />
            <div className="leading-tight">
              <div className="font-serif text-[15px] font-semibold tracking-wide text-paper group-hover:text-gold-soft transition-colors">
                狮舞教学平台
              </div>
              <div className="text-[11px] text-mist tracking-wider">阶段式 · 标准化</div>
            </div>
          </NavLink>

          <nav className="flex items-center gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'text-gold-soft bg-ink-soft'
                      : 'text-mist hover:text-paper hover:bg-ink-soft/60'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2 text-xs text-mist">
            <span className="w-2 h-2 rounded-full bg-vermillion animate-pulse" />
            教练实验室原型
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1440px] px-6 lg:px-10 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-ink-border/60 py-6">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 flex flex-wrap items-center justify-between gap-3 text-xs text-mist">
          <span>南狮阶段式标准化教学 · 高保真交互原型</span>
          <span className="text-gold-dim">简约 · 专业 · 文化 × 科技</span>
        </div>
      </footer>
    </div>
  )
}
