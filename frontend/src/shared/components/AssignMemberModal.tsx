import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';

interface AssignMemberModalProps {
  open: boolean;
  eyebrow: string;
  title: string;
  submitLabel: string;
  isPending: boolean;
  errorMsg: string;
  onClose: () => void;
  onSubmit: (memberName: string) => void;
}

export function AssignMemberModal({
  open,
  eyebrow,
  title,
  submitLabel,
  isPending,
  errorMsg,
  onClose,
  onSubmit,
}: AssignMemberModalProps) {
  const [memberName, setMemberName] = useState('');
  const [localError, setLocalError] = useState('');

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLocalError('');
    if (memberName.trim().length < 2) {
      setLocalError('Ingresa el nombre del socio (mínimo 2 caracteres).');
      return;
    }
    onSubmit(memberName.trim());
    setMemberName('');
  };

  const displayError = errorMsg || localError;

  return createPortal(
    <div
      className="lobo-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="lobo-modal-enter w-[min(400px,100%)] rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
        <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">{eyebrow}</span>
        <h2 className="font-display mt-1 text-[20px] font-semibold text-[#22251f]">{title}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
              Nombre del socio
            </label>
            <input
              type="text"
              autoFocus
              required
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Ej. Alex Rivera"
              className="min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px] outline-none focus:border-[#97bd42]"
            />
          </div>
          {displayError ? <p className="text-[11px] text-red-600">{displayError}</p> : null}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] flex-1 rounded-[3px] border border-[#e2e4dc] text-[10px] font-bold text-[#686b63]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[38px] flex-1 rounded-[3px] bg-[#22251f] text-[10px] font-bold text-white"
            >
              {isPending ? 'Asignando...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

