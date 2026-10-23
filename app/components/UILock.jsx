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

export function LockScreen({ configured, expectedHash, minutes, onSetup, onUnlock, onReset }) {
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [timeout, setTimeout] = useState(String(minutes));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!validPin(pin)) return setError('Use a PIN with 4 to 8 digits.');
    setBusy(true);
    try {
      const hash = await hashPin(pin);
      if (configured) {
        if (hash !== expectedHash) {
          setError('That PIN is incorrect.');
          return;
        }
        onUnlock();
      } else {
        if (pin !== confirmation) {
          setError('The PINs do not match.');
          return;
        }
        const parsedTimeout = Number(timeout);
        if (!Number.isInteger(parsedTimeout) || parsedTimeout < 1 || parsedTimeout > 60) {
          setError('Choose a timeout from 1 to 60 minutes.');
          return;
        }
        onSetup(hash, parsedTimeout);
      }
      setPin('');
      setConfirmation('');
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
        <h1 className="mt-2 text-2xl font-extrabold">{configured ? 'Stockroom locked' : 'Set up your stockroom lock'}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {configured ? 'Enter your PIN to continue.' : 'Create a 4–8 digit PIN. This lock applies only in this browser.'}
        </p>
        {!configured && (
          <>
            <label className="mt-4 block text-sm font-semibold">Confirm PIN
              <input className={`${field} mt-1`} type="password" inputMode="numeric" autoComplete="new-password"
                maxLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            </label>
            <label className="mt-4 block text-sm font-semibold">Lock after inactivity (minutes)
              <input className={`${field} mt-1`} type="number" min="1" max="60" step="1" value={timeout}
                onChange={(event) => setTimeout(event.target.value)} />
            </label>
          </>
        )}
        <label className="mt-4 block text-sm font-semibold">PIN
          <input autoFocus className={`${field} mt-1`} type="password" inputMode="numeric" autoComplete={configured ? 'current-password' : 'new-password'}
            maxLength={8} value={pin} onChange={(event) => setPin(event.target.value)} />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <button className={`${primary} mt-4 w-full`} disabled={busy}>{configured ? 'Unlock stockroom' : 'Set PIN and continue'}</button>
        {configured && <button type="button" className={`${ghost} mt-2 w-full`} onClick={reset}>Forgot PIN? Reset browser lock</button>}
      </form>
    </main>
  );
}

export function LockSettings({ minutes, onClose, onSave }) {
  const [timeout, setTimeout] = useState(String(minutes));
  const [error, setError] = useState('');
  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold">Lock settings</h2>
      <p className="my-2 text-sm text-slate-500 dark:text-slate-400">The stockroom locks after this browser has been inactive. The lock applies only on this device.</p>
      <label className="block text-sm font-semibold">Lock after (minutes)
        <input autoFocus className={`${field} mt-1`} type="number" min="1" max="60" step="1" value={timeout}
          onChange={(event) => setTimeout(event.target.value)} />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
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
        <button className={`${ghost} flex-1`} onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
