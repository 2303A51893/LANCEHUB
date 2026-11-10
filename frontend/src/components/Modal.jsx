
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg'
}) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`relative w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all border border-slate-100 animate-in zoom-in-95 duration-150`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">
              {title}
            </h3>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
