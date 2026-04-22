import React, { useState } from 'react';
import { Delete, X } from 'lucide-react';

interface CalculatorProps {
  value: number;
  onConfirm: (value: number) => void;
  onClose: () => void;
  currencySymbol?: string;
}

export default function Calculator({ value, onConfirm, onClose, currencySymbol = '' }: CalculatorProps) {
  const [display, setDisplay] = useState(value > 0 ? value.toString() : '');
  const [hasDecimal, setHasDecimal] = useState(display.includes('.'));

  const handleNumber = (num: string) => {
    if (display.length > 12) return;
    setDisplay((prev) => prev + num);
  };

  const handleDecimal = () => {
    if (hasDecimal) return;
    setDisplay((prev) => (prev === '' ? '0.' : prev + '.'));
    setHasDecimal(true);
  };

  const handleDelete = () => {
    setDisplay((prev) => {
      const newVal = prev.slice(0, -1);
      if (!newVal.includes('.')) setHasDecimal(false);
      return newVal;
    });
  };

  const handleClear = () => {
    setDisplay('');
    setHasDecimal(false);
  };

  const handleConfirm = () => {
    onConfirm(parseFloat(display) || 0);
  };

  const displayValue = display || '0';

  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] max-w-[430px] mx-auto">
      <div className="bg-bg-card border-t border-border rounded-t-2xl card-shadow">
        {/* Display */}
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
            <X className="w-5 h-5 text-text-muted" />
          </button>
          <div className="text-right flex-1">
            <span className="text-sm text-text-muted mr-1">{currencySymbol}</span>
            <span className="text-2xl font-display text-text-primary">{displayValue}</span>
          </div>
        </div>

        {/* Keys */}
        <div className="grid grid-cols-3 gap-px px-3 pb-2">
          {[
            { label: '1', action: () => handleNumber('1') },
            { label: '2', action: () => handleNumber('2') },
            { label: '3', action: () => handleNumber('3') },
            { label: '4', action: () => handleNumber('4') },
            { label: '5', action: () => handleNumber('5') },
            { label: '6', action: () => handleNumber('6') },
            { label: '7', action: () => handleNumber('7') },
            { label: '8', action: () => handleNumber('8') },
            { label: '9', action: () => handleNumber('9') },
            { label: '.', action: handleDecimal },
            { label: '0', action: () => handleNumber('0') },
            { label: '⌫', action: handleDelete, icon: true },
          ].map((key, i) => (
            <button
              key={i}
              onClick={key.action}
              className="h-12 flex items-center justify-center text-base font-medium rounded-lg active:bg-bg-secondary text-text-primary"
            >
              {key.icon ? <Delete className="w-5 h-5" /> : key.label}
            </button>
          ))}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          <button
            onClick={handleClear}
            className="h-10 flex items-center justify-center text-sm font-medium rounded-xl bg-bg-secondary text-negative"
          >
            AC
          </button>
          <button
            onClick={handleConfirm}
            className="h-10 flex items-center justify-center text-sm font-medium rounded-xl bg-accent text-primary-foreground"
          >
            ✓ Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
