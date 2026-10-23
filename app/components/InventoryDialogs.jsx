import { field, ghost, Modal, primary } from './ui';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function InventoryDialogs({
  newStyle, setNewStyle, styleError, setStyleError, onAddStyle,
  editor, setEditor, error, setError, armed, onSaveColor, onAutoFill, onDeleteColor,
  sheet, setSheet, rows, total, csv, onDownload, onCopy, onShareCsv, shareMessage,
}) {
  return (
    <>
      {newStyle !== null && (
        <Modal onClose={() => setNewStyle(null)}>
          <h2 className="mb-3 text-xl font-bold">Add style</h2>
          <input autoFocus className={field} value={newStyle} placeholder="Style number, e.g. 1019"
            onChange={(e) => { setNewStyle(e.target.value); setStyleError(''); }} />
          <p className="my-2 min-h-[1em] text-sm text-pink-700 dark:text-pink-400">{styleError}</p>
          <div className="flex gap-2">
            <button className={`${primary} flex-1`} onClick={onAddStyle}>Continue</button>
            <button className={`${ghost} flex-1`} onClick={() => setNewStyle(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {editor && (
        <Modal onClose={() => setEditor(null)}>
          <h2 className="mb-3 text-xl font-bold">{editor.i == null ? 'Add color' : 'Edit color'} · Style {editor.s}</h2>
          <label className="text-sm font-semibold text-slate-500">Color name
            <input className={`${field} mt-1`} value={editor.color} placeholder="e.g. Olive"
              onChange={(e) => { setEditor({ ...editor, color: e.target.value }); setError(''); }} />
          </label>
          <div className="my-3 flex items-end gap-2">
            <label className="w-24 text-sm font-semibold text-slate-500">Prefix
              <input className={`${field} mt-1`} value={editor.pre}
                onChange={(e) => setEditor({ ...editor, pre: e.target.value })} />
            </label>
            <button className={`${ghost} flex-1 !min-h-[48px]`} onClick={onAutoFill}>Auto-fill codes</button>
          </div>
          <p className="mb-2 text-xs text-slate-500">Auto-fill writes codes like NY-{editor.s}-OLIVE-S. Check each code against your inventory system and edit it if it differs. Leave a size empty if it is not sold.</p>
          <div className="grid gap-2">
            {SIZES.map((size, index) => (
              <label key={size} className="flex items-center gap-2 text-sm font-bold">
                <span className="w-9">{size}</span>
                <input className={field} autoCapitalize="off" value={editor.codes[index]} placeholder="Seller SKU code"
                  onChange={(e) => {
                    const codes = [...editor.codes];
                    codes[index] = e.target.value;
                    setEditor({ ...editor, codes });
                    setError('');
                  }} />
              </label>
            ))}
          </div>
          <p className="my-2 min-h-[1em] text-sm text-pink-700 dark:text-pink-400">{error}</p>
          <div className="flex flex-wrap gap-2">
            <button className={`${primary} flex-1`} onClick={onSaveColor}>Save</button>
            <button className={`${ghost} flex-1`} onClick={() => setEditor(null)}>Cancel</button>
            {editor.i != null && (
              <button className={`${ghost} w-full !text-red-600`} onClick={onDeleteColor}>
                {armed === 'dc' ? 'Tap again to delete this color' : 'Delete color'}
              </button>
            )}
          </div>
        </Modal>
      )}

      {sheet && (
        <Modal onClose={() => setSheet(false)}>
          {rows.length ? (
            <>
              <h2 className="text-xl font-bold">File is ready</h2>
              <p className="my-2 text-sm text-slate-500">{rows.length} SKUs · {total} pcs</p>
              <pre className="mb-3 max-h-44 overflow-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-800">{csv}</pre>
              {shareMessage && <p role="status" className="mb-3 text-sm text-slate-500">{shareMessage}</p>}
              <div className="flex flex-wrap gap-2">
                <button className={`${primary} flex-1`} onClick={onDownload}>Download CSV</button>
                <button className={`${ghost} flex-1`} onClick={onShareCsv}>Share CSV</button>
                <button className={`${ghost} flex-1`} onClick={onCopy}>Copy CSV</button>
                <button className={`${ghost} flex-1`} onClick={() => setSheet(false)}>Close</button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold">Nothing to generate yet</h2>
              <p className="my-2 text-sm text-slate-500">Enter at least one quantity first.</p>
              <button className={`${ghost} w-full`} onClick={() => setSheet(false)}>Close</button>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
