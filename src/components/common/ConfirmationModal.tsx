import React, { useEffect, useRef } from 'react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  loadingText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  loadingText = 'Removing...',
  variant = 'danger',
  icon = 'delete_forever',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus cancel button for safe keyboard interaction
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !loading) {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const iconBgClass =
    variant === 'danger'
      ? 'bg-red-100 text-red-700 border border-red-200'
      : variant === 'warning'
      ? 'bg-amber-100 text-amber-800 border border-amber-200'
      : 'bg-[#F0F4E8] text-harvest-olive border border-[#91A35A]/30';

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-700 hover:bg-red-800 text-white'
      : variant === 'warning'
      ? 'bg-amber-700 hover:bg-amber-800 text-white'
      : 'bg-harvest-olive hover:bg-harvest-olive-dark text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charred-soil/50 backdrop-blur-sm transition-all animate-fadeIn"
      onClick={() => {
        if (!loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-message"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[#FFFDF9] rounded-2xl border border-pressed-sand shadow-modal-tray p-6 sm:p-7 flex flex-col items-center text-center animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <div className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center mb-4 shrink-0 shadow-sm`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
        )}

        <h3 id="confirmation-modal-title" className="font-headline text-xl font-bold text-charred-soil mb-2">
          {title}
        </h3>

        <div id="confirmation-modal-message" className="font-body text-xs sm:text-sm text-umber-brown mb-6 leading-relaxed max-w-xs sm:max-w-sm">
          {message}
        </div>

        <div className="w-full flex items-center gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-pressed-sand bg-[#FFFDF9] hover:bg-[#F3F0E8] text-charred-soil text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={loading}
            className={`flex-1 py-2.5 px-4 rounded-xl ${confirmBtnClass} text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer`}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{loadingText}</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
