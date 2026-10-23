import { card, field, ghost, primary } from './ui';

const digits = (value) => value.replace(/\D/g, '').slice(0, 4);
const stockInput = (filled) => `h-12 w-full rounded-lg border-2 text-center text-lg font-semibold outline-none focus:border-pink-600 disabled:opacity-30 ${filled ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'}`;

export default function OtherInventory({
  items, form, setForm, onAdd, onChangeQuantity, onRemove, format, setFormat,
  onLoadSample, error, armed, onClear, onReset,
}) {
  return (
    <>
      <div className="content-enter mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight">Other items</h2>
        <p className="mt-1 text-sm text-slate-500">Add a one-off SKU. Adding it again adds to its existing quantity.</p>
      </div>
      <div className={card}>
        <div className="flex flex-wrap gap-2">
          <input value={form.c} onChange={(e) => setForm({ ...form, c: e.target.value, msg: '' })} placeholder="Seller SKU code" autoCapitalize="off" className={`${field} min-w-0 flex-1 basis-48`} />
          <input value={form.q} onChange={(e) => setForm({ ...form, q: digits(e.target.value), msg: '' })} inputMode="numeric" placeholder="Qty" className={`w-20 ${stockInput(false)}`} />
          <button className={primary} onClick={onAdd}>Add</button>
        </div>
        <p className="mt-2 min-h-[1em] text-sm text-pink-700 dark:text-pink-400">{form.msg}</p>
      </div>
      {items.length > 0 && (
        <div className={`${card} mt-3`}>
          {items.map((item, index) => (
            <div key={item.c} className="flex items-center gap-2 border-t border-slate-200 py-2 first:border-0 dark:border-slate-800">
              <b className="flex-1 break-all text-sm">{item.c}</b>
              <input aria-label={`Quantity for ${item.c}`} value={item.q} inputMode="numeric" className={`w-[70px] ${stockInput(item.q !== '')}`}
                onChange={(e) => onChangeQuantity(index, digits(e.target.value))} />
              <button aria-label={`Remove ${item.c}`} className="min-h-[44px] min-w-[40px] text-xl text-slate-500" onClick={() => onRemove(index)}>✕</button>
            </div>
          ))}
        </div>
      )}
      <section className={`${card} card-enter mt-4`}>
        <h3 className="font-bold">Match your CSV headers</h3>
        <p className="mt-1 text-sm text-slate-500">Upload a sample CSV to read its first two column names, or type the names from an example. The downloaded file uses these two columns.</p>
        <label className="mt-3 block text-sm font-semibold">
          Sample CSV
          <input type="file" accept=".csv,text/csv" className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-pink-100 file:px-3 file:py-2 file:font-bold file:text-pink-800"
            onChange={(e) => onLoadSample(e.target.files?.[0])} />
        </label>
        {format.headers?.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">Use this column for SKU
              <select className={`${field} mt-1`} value={format.sku} onChange={(e) => setFormat({ ...format, sku: e.target.value })}>
                {format.headers.map((column, index) => <option key={`${index}-${column}`} value={column}>{column}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">Use this column for quantity
              <select className={`${field} mt-1`} value={format.quantity} onChange={(e) => setFormat({ ...format, quantity: e.target.value })}>
                {format.headers.map((column, index) => <option key={`${index}-${column}`} value={column}>{column}</option>)}
              </select>
            </label>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">SKU column
              <input className={`${field} mt-1`} value={format.sku} onChange={(e) => setFormat({ ...format, sku: e.target.value })} />
            </label>
            <label className="text-sm font-semibold">Quantity column
              <input className={`${field} mt-1`} value={format.quantity} onChange={(e) => setFormat({ ...format, quantity: e.target.value })} />
            </label>
          </div>
        )}
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
        <p className="mt-2 text-xs text-slate-500">The sample stays on your device; only its first row is read. This exports SKU and quantity columns, not extra template fields.</p>
      </section>
      <button className={`${ghost} mt-3 w-full`} onClick={onClear}>{armed === 'ca' ? 'Tap again to clear everything' : 'Clear all quantities'}</button>
      <button className={`${ghost} mt-3 w-full`} onClick={onReset}>{armed === 'rc' ? 'Tap again to reset catalog and stock' : 'Reset catalog to original'}</button>
    </>
  );
}
