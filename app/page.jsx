'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import CAT0 from '../lib/catalog.json';
import InventoryDialogs from './components/InventoryDialogs';
import InventoryHeader from './components/InventoryHeader';
import InventoryList from './components/InventoryList';
import InventoryOverview from './components/InventoryOverview';
import OtherInventory from './components/OtherInventory';
import ReturnsInventory from './components/ReturnsInventory';
import StyleInventory from './components/StyleInventory';
import StyleRangeDialog from './components/StyleRangeDialog';
import { LockScreen, LockSettings } from './components/UILock';
import { primary } from './components/ui';
import { createStyleRange } from '../lib/style-range.mjs';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const quantity = (value) => parseInt(value, 10) || 0;
const csvCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
const parseCsvLine = (line) => {
  const cells = [];
  let cell = '', quoted = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (quoted && line[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (line[i] === ',' && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else cell += line[i];
  }
  cells.push(cell.trim());
  return cells;
};
const PREFILL = {};
Object.values(CAT0).forEach((colors) => colors.forEach(([, items]) => items.forEach((item) => {
  if (item && item[1] != null) PREFILL[item[0]] = String(item[1]);
})));

export default function Page() {
  const [cat, setCat] = useState(CAT0);
  const [styleNames, setStyleNames] = useState({});
  const [stock, setStock] = useState(PREFILL);
  const [customItems, setCustomItems] = useState([]);
  const [returns, setReturns] = useState([]);
  const [tab, setTab] = useState(Object.keys(CAT0)[0]);
  const [screen, setScreen] = useState('home');
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [customForm, setCustomForm] = useState({ c: '', q: '', msg: '' });
  const [returnForm, setReturnForm] = useState({ code: '', quantity: '', error: '' });
  const [armed, setArmed] = useState('');
  const [editor, setEditor] = useState(null);
  const [newStyle, setNewStyle] = useState(null);
  const [rangeForm, setRangeForm] = useState(null);
  const [rangeError, setRangeError] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});
  const [noteErrors, setNoteErrors] = useState({});
  const [format, setFormat] = useState({ sku: 'sellerSkuCode', quantity: 'quantity', headers: [] });
  const [lockHash, setLockHash] = useState(null);
  const [lockMinutes, setLockMinutes] = useState(4);
  const [locked, setLocked] = useState(false);
  const [lockSettingsOpen, setLockSettingsOpen] = useState(false);
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    let savedLock = '';
    let savedLockMinutes = 4;
    try {
      const catalog = localStorage.getItem('cat1');
      const quantities = localStorage.getItem('sv1');
      const custom = localStorage.getItem('sx1');
      const pendingReturns = localStorage.getItem('returns1');
      const headers = localStorage.getItem('csvh1');
      const names = localStorage.getItem('styleNames1');
      const savedTheme = localStorage.getItem('theme1');
      savedLock = localStorage.getItem('uiLockHash1') || '';
      const parsedLockMinutes = Number(localStorage.getItem('uiLockMinutes1'));
      if (Number.isInteger(parsedLockMinutes) && parsedLockMinutes >= 1 && parsedLockMinutes <= 60) {
        savedLockMinutes = parsedLockMinutes;
      }
      if (catalog) {
        const parsedCatalog = JSON.parse(catalog);
        setCat(parsedCatalog);
        setTab(Object.keys(parsedCatalog)[0] || '');
      }
      if (quantities) setStock(JSON.parse(quantities));
      if (custom) setCustomItems(JSON.parse(custom));
      if (pendingReturns) setReturns(JSON.parse(pendingReturns));
      if (headers) setFormat(JSON.parse(headers));
      if (names) setStyleNames(JSON.parse(names));
      if (savedTheme === 'dark') setDark(true);
    } catch {}
    setLockHash(savedLock);
    setLockMinutes(savedLockMinutes);
    setLocked(Boolean(savedLock));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !lockHash || locked) return undefined;
    const duration = lockMinutes * 60 * 1000;
    let timer;
    const lock = () => setLocked(true);
    const resetTimer = () => {
      lastActivity.current = Date.now();
      clearTimeout(timer);
      timer = setTimeout(lock, duration);
    };
    const checkAfterTabReturn = () => {
      if (document.hidden) return;
      if (Date.now() - lastActivity.current >= duration) lock();
      else resetTimer();
    };
    resetTimer();
    window.addEventListener('pointerdown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    document.addEventListener('visibilitychange', checkAfterTabReturn);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      document.removeEventListener('visibilitychange', checkAfterTabReturn);
    };
  }, [ready, lockHash, lockMinutes, locked]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    if (ready) localStorage.setItem('theme1', dark ? 'dark' : 'light');
  }, [dark, ready]);

  useEffect(() => {
    if (!ready) return;
    setSaved('…');
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem('cat1', JSON.stringify(cat));
        localStorage.setItem('sv1', JSON.stringify(stock));
        localStorage.setItem('sx1', JSON.stringify(customItems));
        localStorage.setItem('returns1', JSON.stringify(returns));
        localStorage.setItem('csvh1', JSON.stringify(format));
        localStorage.setItem('styleNames1', JSON.stringify(styleNames));
        setSaved('✓ Saved');
      } catch {}
    }, 400);
    return () => clearTimeout(timeout);
  }, [cat, stock, customItems, returns, format, styleNames, ready]);

  const hasStock = (code) => stock[code] !== undefined && stock[code] !== '';
  const rows = useMemo(() => {
    const result = [];
    Object.entries(cat).forEach(([style, colors]) => colors.forEach(([, items]) => items.forEach((item) => {
      if (item && hasStock(item[0])) result.push([item[0], quantity(stock[item[0]]), style]);
    })));
    customItems.forEach((item) => {
      if (item.q !== '') result.push([item.c, quantity(item.q), 'Other']);
    });
    return result;
  }, [cat, stock, customItems]);
  const inventoryItems = useMemo(() => {
    const result = [];
    Object.entries(cat).forEach(([style, colors]) => colors.forEach(([color, items]) => items.forEach((item, index) => {
      if (item) result.push({
        code: item[0],
        group: style,
        name: styleNames[style] || `Style ${style}`,
        color,
        size: SIZES[index],
        quantity: stock[item[0]] ?? '',
      });
    })));
    customItems.forEach((item) => result.push({
      code: item.c,
      group: 'Other',
      name: 'Other items',
      color: '',
      size: '',
      quantity: item.q,
    }));
    return result;
  }, [cat, styleNames, stock, customItems]);
  const total = rows.reduce((sum, row) => sum + row[1], 0);
  const csv = `${csvCell(format.sku)},${csvCell(format.quantity)}\r\n` +
    rows.map((row) => `${csvCell(row[0])},${csvCell(row[1])}`).join('\r\n') + '\r\n';
  const setQuantity = (code, value) => setStock((previous) => ({ ...previous, [code]: value }));
  const findItem = (sku) => {
    const code = sku.trim().toLowerCase();
    for (const [style, colors] of Object.entries(cat)) {
      for (const [color, items] of colors) {
        const index = items.findIndex((item) => item && item[0].toLowerCase() === code);
        if (index !== -1) return { code: items[index][0], location: `${style} · ${color} · ${SIZES[index]}`, custom: false };
      }
    }
    const custom = customItems.find((item) => item.c.toLowerCase() === code);
    return custom ? { code: custom.c, location: 'Other items', custom: true } : null;
  };
  const addReturn = () => {
    const item = findItem(returnForm.code);
    if (!item) return setReturnForm({ ...returnForm, error: 'SKU not found. Check the code or add it to your inventory first.' });
    if (!quantity(returnForm.quantity)) return setReturnForm({ ...returnForm, error: 'Enter a return quantity greater than zero.' });
    const existing = returns.find((entry) => entry.code.toLowerCase() === item.code.toLowerCase());
    setReturns(existing
      ? returns.map((entry) => entry === existing ? { ...entry, quantity: String(quantity(entry.quantity) + quantity(returnForm.quantity)) } : entry)
      : [...returns, { code: item.code, quantity: returnForm.quantity }]);
    setReturnForm({ code: '', quantity: '', error: '' });
  };
  const restockReturn = (code) => {
    const pending = returns.find((entry) => entry.code.toLowerCase() === code.toLowerCase());
    const item = findItem(code);
    if (!pending || !item) {
      setReturnForm({ ...returnForm, error: 'This SKU is no longer in the inventory. Restore it to the catalog before restocking.' });
      return;
    }
    if (item.custom) {
      setCustomItems((previous) => previous.map((entry) => entry.c === item.code
        ? { ...entry, q: String(quantity(entry.q) + quantity(pending.quantity)) }
        : entry));
    } else {
      setStock((previous) => ({ ...previous, [item.code]: String(quantity(previous[item.code]) + quantity(pending.quantity)) }));
    }
    setReturns((previous) => previous.filter((entry) => entry.code.toLowerCase() !== code.toLowerCase()));
  };
  const returnLocation = (code) => findItem(code)?.location || 'SKU not currently in catalog';

  const usedCodes = (skip) => {
    const used = new Set(customItems.map((item) => item.c.toLowerCase()));
    Object.entries(cat).forEach(([style, colors]) => colors.forEach(([, items], index) => {
      if (!(skip && skip.s === style && skip.i === index)) {
        items.forEach((item) => item && used.add(item[0].toLowerCase()));
      }
    }));
    return used;
  };
  const confirmTwice = (key, action) => {
    if (armed !== key) {
      setArmed(key);
      setTimeout(() => setArmed(''), 3000);
    } else {
      setArmed('');
      action();
    }
  };

  const download = () => {
    const fileUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = `inventory_update_${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(fileUrl);
  };
  const shareApp = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Stockroom | Inventory Manager', text: 'Manage inventory with Stockroom.', url });
      } else {
        await navigator.clipboard.writeText(url);
        setSaved('App link copied');
      }
    } catch (shareError) {
      if (shareError.name !== 'AbortError') setSaved('Could not share app link');
    }
  };
  const shareCsv = async () => {
    try {
      const file = new File([csv], `inventory_update_${new Date().toISOString().slice(0, 10)}.csv`, { type: 'text/csv' });
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: 'Inventory update', text: `${rows.length} SKUs · ${total} units` });
        setShareMessage('Inventory file shared.');
      } else {
        download();
        setShareMessage('File sharing is not available here, so the CSV was downloaded instead.');
      }
    } catch (shareError) {
      if (shareError.name !== 'AbortError') setShareMessage(`Could not share the CSV: ${shareError.message}`);
    }
  };
  const addCustomItem = () => {
    const code = customForm.c.trim();
    const existing = customItems.find((item) => item.c.toLowerCase() === code.toLowerCase());
    const message = !code || /[,"\r\n]/.test(code) ? 'Enter a valid code (no commas or quotes).'
      : customForm.q === '' ? 'Enter a quantity.'
      : usedCodes().has(code.toLowerCase()) && !existing ? 'This code already exists in your catalog.' : '';
    if (message) return setCustomForm({ ...customForm, msg: message });
    setCustomItems(existing
      ? customItems.map((item) => item === existing ? { ...item, q: String(quantity(item.q) + quantity(customForm.q)) } : item)
      : [...customItems, { c: code, q: customForm.q }]);
    setCustomForm({ c: '', q: '', msg: '' });
  };
  const setNote = (key, value) => {
    setNotes((previous) => ({ ...previous, [key]: value }));
    setNoteErrors((previous) => ({ ...previous, [key]: '' }));
  };
  const applyNote = (key, items) => {
    const tokens = (notes[key] || '').split(/[,\n;\s]+/).filter(Boolean);
    const additions = {};
    for (const token of tokens) {
      const match = token.match(/^([a-z]+)\s*=\s*(\d+)$/i);
      if (!match || !SIZES.includes(match[1].toUpperCase())) {
        setNoteErrors((previous) => ({ ...previous, [key]: `Use size=quantity, e.g. S=1, M=2. Check “${token}”.` }));
        return;
      }
      const size = match[1].toUpperCase();
      additions[size] = (additions[size] || 0) + Number(match[2]);
    }
    if (!tokens.length) {
      setNoteErrors((previous) => ({ ...previous, [key]: 'Enter at least one size and quantity.' }));
      return;
    }
    setStock((previous) => {
      const next = { ...previous };
      items.forEach((item, index) => {
        if (item && Object.hasOwn(additions, SIZES[index])) {
          next[item[0]] = String(quantity(previous[item[0]]) + additions[SIZES[index]]);
        }
      });
      return next;
    });
    setNotes((previous) => ({ ...previous, [key]: '' }));
    setNoteErrors((previous) => ({ ...previous, [key]: '' }));
  };
  const loadCsvHeaders = async (file) => {
    if (!file) return;
    try {
      const firstLine = (await file.text()).split(/\r?\n/, 1)[0];
      const columns = parseCsvLine(firstLine);
      if (columns.length < 2 || columns.some((column) => !column)) {
        setError('The sample file needs at least two named columns in its first row.');
        return;
      }
      const findColumn = (terms, fallback) =>
        columns.find((column) => terms.some((term) => column.toLowerCase().replace(/[^a-z]/g, '').includes(term))) || columns[fallback];
      setFormat({
        sku: findColumn(['sku', 'itemcode', 'productcode'], 0),
        quantity: findColumn(['quantity', 'qty', 'stock', 'available'], 1),
        headers: columns,
      });
      setError('');
    } catch (loadError) {
      setError(`Could not read that sample file: ${loadError.message}`);
    }
  };

  const openEditor = (style, index) => {
    setError('');
    if (index == null) return setEditor({ s: style, i: null, color: '', pre: 'NY', codes: ['', '', '', '', ''] });
    const [color, items] = cat[style][index];
    setEditor({ s: style, i: index, color, pre: 'NY', codes: items.map((item) => (item ? item[0] : '')) });
  };
  const autoFillCodes = () => {
    const color = editor.color.trim().toUpperCase().replace(/\s+/g, '');
    if (!color) return setError('Type the color name first.');
    setError('');
    setEditor({ ...editor, codes: SIZES.map((size) => `${editor.pre.trim()}-${editor.s}-${color}-${size}`) });
  };
  const saveColor = () => {
    const color = editor.color.trim();
    const codes = editor.codes.map((code) => code.trim());
    const filledCodes = codes.filter(Boolean);
    const previousItems = editor.i != null ? cat[editor.s][editor.i][1] : [null, null, null, null, null];
    const message = !color ? 'Enter a color name.'
      : !filledCodes.length ? 'Enter at least one SKU code.'
      : codes.some((code) => /[,"\r\n]/.test(code)) ? 'Codes cannot contain commas or quotes.'
      : new Set(filledCodes.map((code) => code.toLowerCase())).size !== filledCodes.length ||
        filledCodes.some((code) => usedCodes(editor).has(code.toLowerCase())) ? 'A code is repeated or already used elsewhere.'
      : previousItems.some((item, index) => item && item[0] !== codes[index] &&
        returns.some((entry) => entry.code.toLowerCase() === item[0].toLowerCase()))
        ? 'Restock pending returns before changing or removing that SKU.'
      : cat[editor.s].some(([existingColor], index) => index !== editor.i && existingColor.toLowerCase() === color.toLowerCase())
        ? 'This color already exists in this style.' : '';
    if (message) return setError(message);
    const items = codes.map((code, index) => (
      code ? [code, previousItems[index] && previousItems[index][0] === code ? previousItems[index][1] : null] : null
    ));
    setStock((previous) => {
      const next = { ...previous };
      previousItems.forEach((item, index) => {
        if (item && item[0] !== codes[index]) {
          if (codes[index] && next[item[0]] !== undefined && next[codes[index]] === undefined) next[codes[index]] = next[item[0]];
          delete next[item[0]];
        }
      });
      return next;
    });
    setCat((previous) => {
      const colors = [...previous[editor.s]];
      if (editor.i == null) colors.push([color, items]);
      else colors[editor.i] = [color, items];
      return { ...previous, [editor.s]: colors };
    });
    setEditor(null);
  };
  const deleteColor = () => {
    const items = cat[editor.s][editor.i][1];
    if (items.some((item) => item && returns.some((entry) => entry.code.toLowerCase() === item[0].toLowerCase()))) {
      setError('Restock pending returns before deleting this color.');
      return;
    }
    setStock((previous) => {
      const next = { ...previous };
      items.forEach((item) => item && delete next[item[0]]);
      return next;
    });
    setCat((previous) => ({ ...previous, [editor.s]: previous[editor.s].filter((_, index) => index !== editor.i) }));
    setEditor(null);
  };
  const addStyle = () => {
    const style = newStyle.trim();
    if (!/^[A-Za-z0-9_-]{1,10}$/.test(style)) return setError('Use letters/numbers only (max 10), e.g. 1019.');
    if (cat[style]) return setError('This style already exists.');
    setCat({ ...cat, [style]: [] });
    setTab(style);
    setScreen('inventory');
    setNewStyle(null);
    openEditor(style, null);
  };
  const generateStyleRange = () => {
    try {
      const { catalog, names, firstStyle } = createStyleRange(rangeForm, cat, [...usedCodes()], SIZES);
      setCat((previous) => ({ ...previous, ...catalog }));
      setStyleNames((previous) => ({ ...previous, ...names }));
      setTab(firstStyle);
      setScreen('inventory');
      setRangeForm(null);
      setRangeError('');
      setSaved(`${Object.keys(catalog).length} styles created`);
    } catch (generationError) {
      setRangeError(generationError.message);
    }
  };
  const deleteStyle = () => {
    const remaining = { ...cat };
    const removed = remaining[tab];
    if (removed.some(([, items]) => items.some((item) =>
      item && returns.some((entry) => entry.code.toLowerCase() === item[0].toLowerCase())))) {
      setError('Restock pending returns before deleting this style.');
      return;
    }
    delete remaining[tab];
    setStock((previous) => {
      const next = { ...previous };
      removed.forEach(([, items]) => items.forEach((item) => item && delete next[item[0]]));
      return next;
    });
    setCat(remaining);
    setStyleNames((previous) => {
      const names = { ...previous };
      delete names[tab];
      return names;
    });
    setTab(Object.keys(remaining)[0] || 'Other');
  };
  const clearAll = () => {
    const emptyStock = {};
    Object.values(cat).forEach((colors) => colors.forEach(([, items]) => items.forEach((item) => item && (emptyStock[item[0]] = ''))));
    setStock(emptyStock);
    setCustomItems((previous) => previous
      .filter((item) => returns.some((entry) => entry.code.toLowerCase() === item.c.toLowerCase()))
      .map((item) => ({ ...item, q: '' })));
  };
  const resetCatalog = () => {
    const defaultCodes = new Set(Object.values(CAT0).flatMap((colors) => colors.flatMap(([, items]) => items.filter(Boolean).map((item) => item[0].toLowerCase()))));
    if (returns.some((entry) => !defaultCodes.has(entry.code.toLowerCase()) && !customItems.some((item) => item.c.toLowerCase() === entry.code.toLowerCase()))) {
      setError('Restock pending returns before resetting the catalog.');
      return;
    }
    setError('');
    setCat(CAT0);
    setStyleNames({});
    setStock(PREFILL);
    setTab(Object.keys(CAT0)[0]);
  };
  const list = tab !== 'Other' && tab !== 'Returns' ? cat[tab] || [] : [];
  const isHome = screen === 'home';
  const isAllInventory = screen === 'inventory-list';
  const currentTitle = isAllInventory ? 'All inventory' : tab === 'Other' ? 'Other items' : tab === 'Returns' ? 'Returned items' : styleNames[tab] || `Style ${tab}`;

  const setupLock = (hash, minutes) => {
    localStorage.setItem('uiLockMinutes1', String(minutes));
    localStorage.setItem('uiLockHash1', hash);
    setLockHash(hash);
    setLockMinutes(minutes);
    setLocked(false);
    setLockSettingsOpen(false);
  };
  const saveLockMinutes = (minutes) => {
    localStorage.setItem('uiLockMinutes1', String(minutes));
    setLockMinutes(minutes);
    setLockSettingsOpen(false);
  };
  const resetLock = () => {
    localStorage.removeItem('uiLockHash1');
    setLockHash('');
    setLocked(false);
    setLockSettingsOpen(false);
  };

  if (!ready || lockHash === null) return <main className="p-6 text-center text-slate-500">Loading stockroom…</main>;
  if (lockHash && locked) {
    return <LockScreen
      expectedHash={lockHash}
      onUnlock={() => setLocked(false)}
      onReset={resetLock}
    />;
  }

  return (
    <>
      {isHome ? (
        <InventoryOverview
          total={total}
          skuCount={rows.length}
          styleCount={Object.keys(cat).length}
          inventoryCount={inventoryItems.length}
          customCount={customItems.length}
          returnCount={returns.length}
          onSelect={(value) => { setTab(value); setScreen('inventory'); }}
          onViewInventory={() => setScreen('inventory-list')}
          onGenerateRange={() => { setRangeError(''); setRangeForm({ start: '', end: '', name: '', colors: '', skuPattern: '' }); }}
          onAddStyle={() => { setError(''); setNewStyle(''); }}
          onResetCatalog={() => confirmTwice('rc', resetCatalog)}
          armed={armed}
          error={error}
          onShareApp={shareApp}
          dark={dark}
          onToggleTheme={() => setDark((value) => !value)}
          lockEnabled={Boolean(lockHash)}
          onLockNow={() => setLocked(true)}
          onLockSettings={() => setLockSettingsOpen(true)}
        />
      ) : (
        <>
          <InventoryHeader
            title={currentTitle}
            subtitle={!isAllInventory && tab !== 'Other' && tab !== 'Returns' ? styleNames[tab] : ''}
            onHome={() => setScreen('home')}
            dark={dark}
            onToggleTheme={() => setDark((value) => !value)}
            lockEnabled={Boolean(lockHash)}
            onLockNow={() => setLocked(true)}
          />
          {isAllInventory ? (
            <InventoryList
              items={inventoryItems}
              total={total}
              onSelect={(value) => { setTab(value); setScreen('inventory'); }}
            />
          ) : (
            <main key={tab} className="mx-auto max-w-5xl p-4 pb-32 content-enter">
              {tab !== 'Other' && tab !== 'Returns' ? (
          <StyleInventory
            tab={tab}
            styleName={styleNames[tab]}
            list={list}
            stock={stock}
            setStock={setQuantity}
            armed={armed}
            notes={notes}
            noteErr={noteErrors}
            setNote={setNote}
            applyNote={applyNote}
            onAddColor={() => openEditor(tab, null)}
            onEditColor={(index) => openEditor(tab, index)}
            onDeleteStyle={() => confirmTwice('ds', deleteStyle)}
            onFillEmpty={(items) => setStock((previous) => {
              const next = { ...previous };
              items.forEach((item) => item && !hasStock(item[0]) && (next[item[0]] = '0'));
              return next;
            })}
          />
            ) : tab === 'Other' ? (
          <OtherInventory
            items={customItems}
            form={customForm}
            setForm={setCustomForm}
            onAdd={addCustomItem}
            onChangeQuantity={(index, value) => setCustomItems((previous) => previous.map((item, i) => i === index ? { ...item, q: value } : item))}
            onRemove={(index) => {
              const item = customItems[index];
              if (returns.some((entry) => entry.code.toLowerCase() === item.c.toLowerCase())) {
                setError('Restock pending returns before removing this SKU.');
                return;
              }
              setCustomItems((previous) => previous.filter((_, i) => i !== index));
            }}
            format={format}
            setFormat={setFormat}
            onLoadSample={loadCsvHeaders}
            error={error}
            armed={armed}
            onClear={() => confirmTwice('ca', clearAll)}
            onReset={() => confirmTwice('rc', resetCatalog)}
          />
              ) : (
          <ReturnsInventory
            returns={returns}
            form={returnForm}
            setForm={setReturnForm}
            onAdd={addReturn}
            onRestock={restockReturn}
            locationForCode={returnLocation}
          />
              )}
            </main>
          )}
        </>
      )}

      {!isHome && <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <span className="min-w-[70px] text-sm text-emerald-700 dark:text-emerald-400">{saved}</span>
          <button className={`${primary} flex-1 text-base`} onClick={() => { setShareMessage(''); setShowExport(true); }}>Save &amp; generate file</button>
        </div>
      </footer>}

      <InventoryDialogs
        newStyle={newStyle}
        setNewStyle={setNewStyle}
        styleError={error}
        setStyleError={setError}
        onAddStyle={addStyle}
        editor={editor}
        setEditor={setEditor}
        error={error}
        setError={setError}
        armed={armed}
        onSaveColor={saveColor}
        onAutoFill={autoFillCodes}
        onDeleteColor={() => confirmTwice('dc', deleteColor)}
        sheet={showExport}
        setSheet={setShowExport}
        rows={rows}
        total={total}
        csv={csv}
        onDownload={download}
        onCopy={async () => {
          try {
            await navigator.clipboard.writeText(csv);
            setShareMessage('CSV copied to clipboard.');
          } catch (copyError) {
            setShareMessage(`Could not copy the CSV: ${copyError.message}`);
          }
        }}
        onShareCsv={shareCsv}
        shareMessage={shareMessage}
      />
      {rangeForm && (
        <StyleRangeDialog
          form={rangeForm}
          setForm={setRangeForm}
          error={rangeError}
          onGenerate={generateStyleRange}
          onClose={() => { setRangeForm(null); setRangeError(''); }}
        />
      )}
      {lockSettingsOpen && (
        <LockSettings
          configured={Boolean(lockHash)}
          minutes={lockMinutes}
          onClose={() => setLockSettingsOpen(false)}
          onEnable={setupLock}
          onSave={saveLockMinutes}
          onDisable={resetLock}
        />
      )}
    </>
  );
}
