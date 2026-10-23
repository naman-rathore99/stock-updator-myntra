import { ghost } from './ui';

export default function InventoryHeader({ title, subtitle, onHome, dark, onToggleTheme, lockEnabled, onLockNow }) {
  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onHome} className={`${ghost} !min-h-10 !px-3`} aria-label="Back to home">← Home</button>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-700 dark:text-pink-400">Stockroom</p>
            <h1 className="truncate font-bold">{title}</h1>
            {subtitle && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          {lockEnabled && <button onClick={onLockNow} className={`${ghost} !min-h-10 !px-3`}>Lock now</button>}
          <button onClick={onToggleTheme} className={`${ghost} !min-h-10 !px-3`}>{dark ? 'Light mode' : 'Dark mode'}</button>
        </div>
      </div>
    </header>
  );
}
