'use client';
import { useState } from 'react';
import { field, ghost, Modal, primary } from './ui';

async function hashPin(pin) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function validPin(pin) {
  return /^\d{4,8}$/.test(pin);
}

export function LockScreen({ expectedHash, onUnlock, onReset }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!validPin(pin)) return setError('Use a PIN with 4 to 8 digits.');
    setBusy(true);
    try {
      const hash = await hashPin(pin);
      if (hash !== expectedHash) {
        setError('That PIN is incorrect.');
        return;
      }
      onUnlock();
      setPin('');
    } catch (lockError) {
      setError(`Could not process the PIN: ${lockError.message}`);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    if (window.confirm('Reset the browser lock? This keeps your inventory but lets anyone using this browser set a new PIN.')) {
      onReset();
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-700 dark:text-pink-400">Stockroom</p>
        <h1 className="mt-2 text-2xl font-extrabold">Stockroom locked</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Enter your PIN to continue.</p>
        <label className="mt-4 block text-sm font-semibold">PIN
          <input autoFocus className={`${field} mt-1`} type="password" inputMode="numeric" autoComplete="current-password"
            maxLength={8} value={pin} onChange={(event) => setPin(event.target.value)} />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <button className={`${primary} mt-4 w-full`} disabled={busy}>Unlock stockroom</button>
        <button type="button" className={`${ghost} mt-2 w-full`} onClick={reset}>Forgot PIN? Reset browser lock</button>
      </form>
    </main>
  );
}

export function LockSettings({ configured, minutes, onClose, onEnable, onSave, onDisable }) {
  const [timeout, setTimeout] = useState(String(minutes));
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold">Lock settings</h2>
      <p className="my-2 text-sm text-slate-500 dark:text-slate-400">
        {configured ? 'The browser lock is enabled. It applies only on this device.' : 'The lock is optional and currently disabled. When enabled, it applies only on this device.'}
      </p>
      {!configured && <>
        <label className="mt-4 block text-sm font-semibold">PIN (4–8 digits)
          <input autoFocus className={`${field} mt-1`} type="password" inputMode="numeric" autoComplete="new-password"
            maxLength={8} value={pin} onChange={(event) => setPin(event.target.value)} />
        </label>
        <label className="mt-4 block text-sm font-semibold">Confirm PIN
          <input className={`${field} mt-1`} type="password" inputMode="numeric" autoComplete="new-password"
            maxLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </label>
      </>}
      <label className="mt-4 block text-sm font-semibold">Lock after inactivity (minutes)
        <input className={`${field} mt-1`} type="number" min="1" max="60" step="1" value={timeout}
          onChange={(event) => setTimeout(event.target.value)} />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        {!configured ? <button className={`${primary} flex-1`} disabled={busy} onClick={async () => {
          setError('');
          if (!validPin(pin)) return setError('Use a PIN with 4 to 8 digits.');
          if (pin !== confirmation) return setError('The PINs do not match.');
          const parsed = Number(timeout);
          if (!Number.isInteger(parsed) || parsed < 1 || parsed > 60) {
            setError('Choose a timeout from 1 to 60 minutes.');
            return;
          }
          setBusy(true);
          try {
            onEnable(await hashPin(pin), parsed);
          } catch (enableError) {
            setError(`Could not enable the lock: ${enableError.message}`);
          } finally {
            setBusy(false);
          }
        }}>Enable lock</button> : <>
          <button className={`${primary} flex-1`} onClick={() => {
            const parsed = Number(timeout);
            if (!Number.isInteger(parsed) || parsed < 1 || parsed > 60) {
              setError('Choose a timeout from 1 to 60 minutes.');
              return;
            }
            try {
              onSave(parsed);
            } catch (saveError) {
              setError(`Could not save lock settings: ${saveError.message}`);
            }
          }}>Save timeout</button>
          <button className={`${ghost} flex-1 !text-red-600`} onClick={onDisable}>Disable lock</button>
        </>}
        <button className={`${ghost} flex-1`} onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
