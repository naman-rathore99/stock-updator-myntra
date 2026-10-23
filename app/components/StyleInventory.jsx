import { card, link, primary } from './ui';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const quantity = (value) => parseInt(value, 10) || 0;
const digits = (value) => value.replace(/\D/g, '').slice(0, 4);
const stockInput = (filled) => `h-12 w-full rounded-lg border-2 text-center text-lg font-semibold outline-none focus:border-pink-600 disabled:opacity-30 ${filled ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'}`;

export default function StyleInventory({
  tab, styleName, list, stock, setStock, armed, notes, noteErr, setNote, applyNote,
  onAddColor, onEditColor, onDeleteStyle, onFillEmpty,
}) {
  const has = (code) => stock[code] !== undefined && stock[code] !== '';

  return (
    <>
      <div className="content-enter mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">{styleName || `Style ${tab}`}</h2>
          <p className="mt-1 text-sm text-slate-500">Type a final count, add units with +1, or enter notes like <b>S=1, M=2</b>.</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button className={link} onClick={onAddColor}>+ Add color</button>
          <button className={`${link} !text-slate-500`} onClick={onDeleteStyle}>{armed === 'ds' ? 'Tap again' : 'Delete style'}</button>
        </div>
      </div>
      {!list.length && <p className={`${card} text-center text-slate-500`}>No colors yet. Tap “+ Add color”.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {list.map(([color, items], colorIndex) => {
          const key = `${tab}-${colorIndex}`;
          return (
            <section key={color} style={{ animationDelay: `${Math.min(colorIndex * 55, 275)}ms` }} className={`${card} card-enter`}>
              <div className="mb-2 flex items-center justify-between font-bold">
                <span className="text-lg">{color}</span>
                <span className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  Total {items.reduce((total, item) => total + (item && has(item[0]) ? quantity(stock[item[0]]) : 0), 0)}
                  <button className={link} onClick={() => onEditColor(colorIndex)}>Edit</button>
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {items.map((item, index) => (
                  <label key={index} className="block text-center text-xs font-semibold text-slate-500">
                    {SIZES[index]}
                    <input disabled={!item} inputMode="numeric" autoComplete="off" aria-label={`${color} ${SIZES[index]}`}
                      value={item ? stock[item[0]] ?? '' : ''} onFocus={(e) => e.target.select()}
                      onChange={(e) => item && setStock(item[0], digits(e.target.value))}
                      className={`mt-1 ${stockInput(item && has(item[0]))}`} />
                    <button type="button" disabled={!item} aria-label={`Add one ${color} size ${SIZES[index]}`}
                      className="mt-1 min-h-[32px] w-full rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-pink-100 disabled:opacity-30 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-pink-950"
                      onClick={() => item && setStock(item[0], String(quantity(stock[item[0]]) + 1))}>+1</button>
                    <button type="button" disabled={!item || quantity(stock[item[0]]) === 0}
                      aria-label={`Remove one ${color} size ${SIZES[index]}`}
                      className="mt-1 min-h-[32px] w-full rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-red-950"
                      onClick={() => item && setStock(item[0], String(Math.max(0, quantity(stock[item[0]]) - 1)))}>-1</button>
                  </label>
                ))}
              </div>
              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor={`note-${key}`}>Quick add · adds to current stock</label>
                <div className="flex gap-2">
                  <input id={`note-${key}`} value={notes[key] || ''} placeholder="S=1, M=2, S=1"
                    onChange={(e) => setNote(key, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') applyNote(key, items); }}
                    className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none transition focus:border-pink-600 focus:ring-4 focus:ring-pink-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-pink-950" />
                  <button className={primary} onClick={() => applyNote(key, items)}>Add</button>
                </div>
                {noteErr[key] && <p role="alert" className="mt-1 text-sm text-red-600">{noteErr[key]}</p>}
              </div>
              <button className={`${link} mt-1`} onClick={() => onFillEmpty(items)}>Fill empty boxes with 0</button>
            </section>
          );
        })}
      </div>
    </>
  );
}
