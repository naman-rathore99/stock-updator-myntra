import { useState } from 'react';
import { card } from './ui';

export default function InventoryList({ items, total, onSelect }) {
  const [search, setSearch] = useState('');
  const filteredItems = items.filter((item) =>
    `${item.code} ${item.style} ${item.name} ${item.color} ${item.size}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()));

  return (
    <main className="mx-auto max-w-5xl p-4 pb-32 content-enter">
      <section className={`${card} mb-4 !translate-y-0`}>
        <h2 className="text-2xl font-extrabold tracking-tight">All inventory</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {items.length} SKUs · {total} units in stock. Select a SKU to edit its group.
        </p>
      </section>
      <input
        className="mb-3 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-pink-600 focus:ring-4 focus:ring-pink-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-pink-950"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search SKU, style, color, or size"
        aria-label="Search all inventory"
      />
      <div className={`${card} overflow-hidden !p-0 !translate-y-0`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Style / group</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={`${item.group}-${item.code}`} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-semibold">
                    <button className="text-left text-pink-700 hover:underline dark:text-pink-400"
                      onClick={() => onSelect(item.group)}>{item.code}</button>
                  </td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.color || '—'}</td>
                  <td className="px-4 py-3">{item.size || '—'}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">
                    {item.quantity === '' ? <span className="font-normal text-slate-400">Not entered</span> : item.quantity}
                  </td>
                </tr>
              ))}
              {!filteredItems.length && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    {items.length ? 'No inventory matches your search.' : 'No inventory items yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
