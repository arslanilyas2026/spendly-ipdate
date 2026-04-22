import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export default function TopBar({ title, showBack = false, right }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-4 h-14 flex items-center gap-3">
      {showBack && (
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-secondary -ml-1">
          <ChevronLeft className="w-5 h-5 text-text-primary" />
        </button>
      )}
      <h1 className="text-lg font-semibold text-text-primary flex-1 truncate">{title}</h1>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
