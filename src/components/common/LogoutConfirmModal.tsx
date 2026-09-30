import React from 'react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charred-soil/50 backdrop-blur-sm transition-all animate-fadeIn">
      <div className="w-full max-w-md bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-modal-tray p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-error-container/60 text-error flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-2xl">logout</span>
        </div>

        <h3 className="font-headline text-xl font-bold text-charred-soil mb-2">
          Confirm Sign Out
        </h3>
        <p className="font-body text-sm text-umber-brown mb-6 max-w-xs">
          Are you sure you want to end your active farming session? You will need to sign in again to access your farm telemetry.
        </p>

        <div className="w-full flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-md border border-pressed-sand bg-[#FFFDF9] hover:bg-[#F3F0E8] text-charred-soil text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-md bg-error hover:bg-error/90 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
