export const card = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900';
export const btn = 'min-h-[50px] rounded-xl px-4 font-bold';
export const primary = `${btn} bg-pink-700 text-white dark:bg-pink-500 dark:text-slate-950`;
export const ghost = `${btn} border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800`;
export const field = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none transition focus:border-pink-600 focus:ring-4 focus:ring-pink-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-pink-950';
export const link = 'py-1.5 text-sm font-semibold text-pink-700 dark:text-pink-400';

export function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 md:items-center" onClick={onClose}>
      <div className="max-h-[90%] w-full max-w-xl overflow-auto rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:rounded-3xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
