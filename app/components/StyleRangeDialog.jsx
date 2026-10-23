import { field, ghost, Modal, primary } from './ui';

export default function StyleRangeDialog({ form, setForm, error, onGenerate, onClose }) {
  const previewStyle = form.start || '1001';
  const previewColor = form.colors.split(',').map((color) => color.trim()).find(Boolean) || 'Olive';
  const preview = form.skuPattern
    .replaceAll('{style}', previewStyle)
    .replaceAll('{color}', previewColor.toUpperCase().replace(/\s+/g, '-'))
    .replaceAll('{size}', 'S');
  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold">Generate a style range</h2>
      <p className="mt-1 text-sm text-slate-500">Create many styles together, with the same item type and colors.</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm font-semibold">From style
          <input className={`${field} mt-1`} inputMode="numeric" value={form.start} placeholder="1001"
            onChange={(event) => update('start', event.target.value)} />
        </label>
        <label className="text-sm font-semibold">To style
          <input className={`${field} mt-1`} inputMode="numeric" value={form.end} placeholder="1050"
            onChange={(event) => update('end', event.target.value)} />
        </label>
      </div>
      <label className="mt-3 block text-sm font-semibold">Item type or name
        <input className={`${field} mt-1`} value={form.name} placeholder="e.g. Everyday cotton kurta"
          onChange={(event) => update('name', event.target.value)} />
      </label>
      <label className="mt-3 block text-sm font-semibold">Colors shared by these styles
        <input className={`${field} mt-1`} value={form.colors} placeholder="Olive, Black, Peach"
          onChange={(event) => update('colors', event.target.value)} />
      </label>
      <label className="mt-3 block text-sm font-semibold">Your seller SKU pattern
        <input className={`${field} mt-1`} value={form.skuPattern} placeholder="NY-{style}-{color}-{size}"
          onChange={(event) => update('skuPattern', event.target.value)} />
      </label>
      <p className="mt-1 text-xs text-slate-500">Use <code>{'{style}'}</code>, <code>{'{color}'}</code>, and <code>{'{size}'}</code> where those values belong. Preview: <b className="break-all">{preview}</b></p>
      <p className="mt-2 text-xs text-slate-500">Existing styles in the range are kept unchanged. New styles get the shared colors and generated SKU codes; quantities start blank.</p>
      {error && <p role="alert" className="my-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button className={`${primary} flex-1`} onClick={onGenerate}>Create styles</button>
        <button className={`${ghost} flex-1`} onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
