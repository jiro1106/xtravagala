import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const ease = [0.23, 1, 0.36, 1] as const;

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onCancel();
    }
    window.addEventListener('keydown', onKey);

    const t = setTimeout(() => confirmRef.current?.focus(), 40);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, busy, onCancel]);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease }}
          onClick={() => { if (!busy) onCancel(); }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(20, 22, 24, 0.48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(2px)',
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={description ? 'confirm-dialog-desc' : undefined}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg)',
              borderRadius: 18,
              padding: '24px 24px 20px',
              maxWidth: 420,
              width: '100%',
              boxShadow:
                '0 24px 64px -16px rgba(0,0,0,0.32), 0 0 0 1px rgba(0,0,0,0.04)',
            }}
          >
            <h2
              id="confirm-dialog-title"
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.018em',
                lineHeight: 1.3,
              }}
            >
              {title}
            </h2>
            {description && (
              <p
                id="confirm-dialog-desc"
                style={{
                  margin: '8px 0 0',
                  fontSize: 14,
                  color: 'var(--text-mute)',
                  lineHeight: 1.55,
                }}
              >
                {description}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
                marginTop: 22,
              }}
            >
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                style={{
                  border: '1px solid var(--border)',
                  background: '#fff',
                  borderRadius: 100,
                  padding: '9px 18px',
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: 'var(--text)',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.6 : 1,
                  transition: 'border-color 0.18s, color 0.18s',
                }}
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={() => void handleConfirm()}
                disabled={busy}
                style={{
                  border: 'none',
                  background: destructive
                    ? 'oklch(54% 0.20 25)'
                    : 'var(--primary)',
                  borderRadius: 100,
                  padding: '9px 18px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.7 : 1,
                  transition: 'opacity 0.18s, background-color 0.18s',
                  minWidth: 110,
                }}
              >
                {busy ? 'Working…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
