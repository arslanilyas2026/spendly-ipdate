import { Home, Receipt, BarChart3, MoreHorizontal, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from '@/utils/translations';

interface BottomNavProps {
  onFabPress: () => void;
  fabOpen?: boolean;
}

const TABS = [
  { path: '/', icon: Home, label: 'home' },
  { path: '/transactions', icon: Receipt, label: 'transactions' },
  { path: '__fab__', icon: Plus, label: '' },
  { path: '/report', icon: BarChart3, label: 'report' },
  { path: '/more', icon: MoreHorizontal, label: 'more' },
];

export default function BottomNav({ onFabPress, fabOpen }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="bg-bottom-nav/80 glass border-t border-border/60 h-[72px] flex items-center justify-around px-3">
        {TABS.map((tab) => {
          if (tab.path === '__fab__') {
            return (
              <button
                key="fab"
                onClick={onFabPress}
                className="w-13 h-13 rounded-[18px] gradient-accent flex items-center justify-center -mt-6 shadow-lg shadow-accent/25 transition-all duration-300 active:scale-90"
                style={{ transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
              >
                <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
              </button>
            );
          }
          const active = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center gap-1 min-w-[52px] h-full transition-all duration-200 active:scale-90"
            >
              {active && (
                <div className="absolute -top-0.5 w-5 h-[3px] rounded-full bg-accent animate-scale-in" />
              )}
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-accent/10' : ''}`}>
                <Icon className={`w-[22px] h-[22px] transition-all duration-200 ${active ? 'text-accent' : 'text-text-muted'}`} strokeWidth={active ? 2.2 : 1.8} />
              </div>
              <span className={`text-[10px] transition-all duration-200 ${active ? 'text-accent font-semibold' : 'text-text-muted font-medium'}`}>
                {t(tab.label)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
