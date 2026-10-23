import { card, ghost, primary } from './ui';
import { useState } from 'react';

export default function InventoryOverview({
  total, skuCount, styleCount, styles, customCount, returnCount, onSelect,
  onGenerateRange, onAddStyle, onShareApp, dark, onToggleTheme, onResetCatalog, armed, error,
  onLockNow, onLockSettings,
}) {
  const [search, setSearch] = useState('');
  const filteredStyles = styles.filter((style) =>
    `${style.value} ${style.name || ''}`.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <main className="mx-auto max-w-5xl p-4 pb-12">
      <section className="overview-enter mb-7 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-700 dark:text-pink-400">Inventory workspace</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Stockroom</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">Choose an inventory to update. Keep returns separate, or generate a new range of styles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={ghost} onClick={onLockSettings}>Lock settings</button>
          <button className={ghost} onClick={onLockNow}>Lock now</button>
          <button className={ghost} onClick={onToggleTheme}>{dark ? 'Use light mode' : 'Use dark mode'}</button>
          <button className={ghost} onClick={onShareApp}>Share app</button>
          <button className={primary} onClick={onGenerateRange}>Generate style range</button>
          <button className={ghost} onClick={onAddStyle}>+ One style</button>
        </div>
      </section>

      <section className="content-enter mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className={`${card} !translate-y-0`}><p className="text-2xl font-extrabold">{total}</p><p className="text-sm text-slate-500 dark:text-slate-400">Units in stock</p></div>
        <div className={`${card} !translate-y-0`}><p className="text-2xl font-extrabold">{skuCount}</p><p className="text-sm text-slate-500 dark:text-slate-400">SKUs with stock</p></div>
        <div className={`${card} col-span-2 !translate-y-0 sm:col-span-1`}><p className="text-2xl font-extrabold">{styleCount}</p><p className="text-sm text-slate-500 dark:text-slate-400">Styles in catalog</p></div>
      </section>

      <section className="content-enter">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">Your inventory</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select an item group to open its stock panel.</p>
          </div>
        </div>
        <input className="mb-3 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-pink-600 focus:ring-4 focus:ring-pink-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-pink-950"
          value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a style or item name" aria-label="Search inventory" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStyles.map((style) => (
            <button key={style.value} onClick={() => onSelect(style.value)}
              className={`${card} card-enter text-left hover:border-pink-300 dark:hover:border-pink-800`}>
              <span className="block text-xs font-bold uppercase tracking-wide text-pink-700 dark:text-pink-400">Style {style.value}</span>
              <span className="mt-1 block text-lg font-bold">{style.name || 'Stock details'}</span>
              <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">{style.colorCount} colors · {style.filled}/{style.skuCount} sizes entered</span>
            </button>
          ))}
          {!filteredStyles.length && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {styles.length ? 'No styles match. Other items and returns are still available below.' : 'No styles are set up yet. Generate a range, add one style, or restore the starter catalog.'}
              </p>
              {!styles.length && <button className={`${ghost} mt-3`} onClick={onResetCatalog}>{armed === 'rc' ? 'Tap again to restore starter catalog' : 'Restore starter catalog'}</button>}
              {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          )}
          <button onClick={() => onSelect('Other')} className={`${card} card-enter text-left hover:border-pink-300 dark:hover:border-pink-800`}>
            <span className="block text-xs font-bold uppercase tracking-wide text-pink-700 dark:text-pink-400">One-off items</span>
            <span className="mt-1 block text-lg font-bold">Other items</span>
            <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">{customCount} items</span>
          </button>
          <button onClick={() => onSelect('Returns')} className={`${card} card-enter text-left hover:border-amber-300 dark:hover:border-amber-800`}>
            <span className="block text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">Returns desk</span>
            <span className="mt-1 block text-lg font-bold">Returned items</span>
            <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">{returnCount} pending returns</span>
          </button>
        </div>
      </section>
    </main>
  );
}
