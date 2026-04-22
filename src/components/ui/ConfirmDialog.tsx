import React from 'react';
import Modal from './Modal';
import { t } from '@/utils/translations';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  destructive?: boolean;
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText, destructive = true }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[300px]">
      <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary mb-5">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-text-primary"
        >
          {t('cancel')}
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`flex-1 h-10 rounded-xl text-sm font-medium ${
            destructive
              ? 'bg-negative text-primary-foreground'
              : 'bg-accent text-primary-foreground'
          }`}
        >
          {confirmText || t('delete')}
        </button>
      </div>
    </Modal>
  );
}
