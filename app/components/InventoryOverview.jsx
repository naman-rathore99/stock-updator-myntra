import { card, ghost, primary } from './ui';

export default function InventoryOverview({
  total, skuCount, styleCount, inventoryCount, customCount, returnCount, onSelect, onViewInventory,
  onGenerateRange, onAddStyle, onShareApp, dark, onToggleTheme, onResetCatalog, armed, error,
  lockEnabled, onLockNow, onLockSettings,
}) {
  return (
    <main className="mx-auto max-w-5xl p-4 pb-12">
      <section className="overview-enter mb-7 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-700 dark:text-pink-400">Inventory workspace</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Stockroom</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">Choose an inventory to update. Keep returns separate, or generate a new range of styles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={ghost} onClick={onLockSettings}>{lockEnabled ? 'Lock settings' : 'Enable lock'}</button>
          {lockEnabled && <button className={ghost} onClick={onLockNow}>Lock now</button>}
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

      <section className="content-enter grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button onClick={onViewInventory} className={`${card} card-enter text-left hover:border-pink-300 dark:hover:border-pink-800`}>
          <span className="block text-xs font-bold uppercase tracking-wide text-pink-700 dark:text-pink-400">Stock overview</span>
          <span className="mt-1 block text-lg font-bold">View all inventory</span>
          <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">{inventoryCount} SKUs · {total} units</span>
        </button>
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
      </section>
      {!styleCount && <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-300">No styles are set up yet. Generate a range, add one style, or restore the starter catalog.</p>
        <button className={`${ghost} mt-3`} onClick={onResetCatalog}>{armed === 'rc' ? 'Tap again to restore starter catalog' : 'Restore starter catalog'}</button>
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      </div>}
    </main>
  );
}
