import React, { useEffect, useId, useMemo, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (root: HTMLElement): HTMLElement[] => {
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1
  );
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, className, children }) => {
  const reactId = useId();
  const titleId = useMemo(() => `modal-title-${reactId}`, [reactId]);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const priorBodyOverflowRef = useRef<string>('');
  const priorFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    priorFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    priorBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the close button ASAP for keyboard users.
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;
      const dialogEl = dialogRef.current;
      if (!dialogEl) return;

      const focusables = getFocusableElements(dialogEl);
      if (focusables.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const currentIndex = active ? focusables.indexOf(active) : -1;

      // Cycle focus within the dialog.
      if (e.shiftKey) {
        if (currentIndex <= 0) {
          e.preventDefault();
          focusables[focusables.length - 1].focus();
        }
      } else {
        if (currentIndex === -1 || currentIndex === focusables.length - 1) {
          e.preventDefault();
          focusables[0].focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = priorBodyOverflowRef.current;
      priorFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={['w-full max-w-lg rounded-lg bg-white shadow-xl', className].filter(Boolean).join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          {title ? (
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close modal"
            className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            onClick={() => onClose()}
          >
            ×
          </button>
        </div>

        <div className="px-4 py-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
