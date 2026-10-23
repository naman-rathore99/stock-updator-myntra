import { card, field, primary } from './ui';

const digits = (value) => value.replace(/\D/g, '').slice(0, 4);

export default function ReturnsInventory({ returns, form, setForm, onAdd, onRestock, locationForCode }) {
  return (
    <section className="content-enter">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-700 dark:text-pink-400">Returns desk</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Returned items</h2>
        <p className="mt-1 text-sm text-slate-500">Log a return by its exact SKU. It stays separate from sellable stock until you add it back.</p>
      </div>
      <div className={card}>
        <div className="flex flex-wrap gap-2">
          <input className={`${field} min-w-0 flex-1 basis-48`} value={form.code} autoCapitalize="off"
            aria-label="Returned SKU" placeholder="Scan or enter SKU"
            onChange={(e) => setForm({ ...form, code: e.target.value, error: '' })}
            onKeyDown={(e) => { if (e.key === 'Enter') onAdd(); }} />
          <input className="h-12 w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 text-center outline-none focus:border-pink-600 dark:border-slate-700 dark:bg-slate-800"
            value={form.quantity} inputMode="numeric" aria-label="Return quantity" placeholder="Qty"
            onChange={(e) => setForm({ ...form, quantity: digits(e.target.value), error: '' })}
            onKeyDown={(e) => { if (e.key === 'Enter') onAdd(); }} />
          <button className={primary} onClick={onAdd}>Log return</button>
        </div>
        {form.error && <p role="alert" className="mt-2 text-sm text-red-600">{form.error}</p>}
      </div>
      <div className={`${card} card-enter mt-4`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Pending returns</h3>
          <span className="text-sm text-slate-500">{returns.reduce((sum, item) => sum + Number(item.quantity), 0)} units</span>
        </div>
        {returns.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {returns.map((item) => (
              <div key={item.code} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="break-all text-sm font-bold">{item.code}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{locationForCode(item.code)}</p>
                </div>
                <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">{item.quantity} pending</span>
                <button className={`${primary} !min-h-10 !px-3 text-sm`} onClick={() => onRestock(item.code)}>Add back to stock</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800">No pending returns. Scan or enter a SKU above to log one.</p>
        )}
      </div>
    </section>
  );
}
