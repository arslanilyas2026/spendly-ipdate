import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-[340px]' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 animate-fade-in" />
      <div
        className={`relative bg-bg-card rounded-2xl ${maxWidth} w-full p-5 animate-scale-in card-shadow`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="text-base font-semibold text-text-primary mb-3">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
